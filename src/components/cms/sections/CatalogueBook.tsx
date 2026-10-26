"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * CATALOGUE_BOOK
 * ==============
 * The printed catalogue, read on the page as a book.
 *
 * The PDF is rasterised in the browser a page at a time by pdf.js and laid out
 * two pages to a spread, with a sheet that turns on its spine between spreads.
 * Nothing is pre-rendered at build time: the catalogue is replaced every
 * season, and a build step would let the pictures and the file drift apart.
 *
 * Only the spread being read and its immediate neighbours are rasterised. All
 * twenty-six pages at once is several hundred megabytes of canvas for a reader
 * who will usually look at four of them.
 *
 * On a phone there is no room for two pages side by side, so it falls back to
 * one page at a time with a cross-fade: a turn in perspective needs the width
 * of a spread to read as a turn at all.
 *
 * The file itself stays a plain download link, so a buyer who just wants the
 * PDF never has to go through any of this.
 */

type Data = Record<string, any>;

/**
 * pdf.js is loaded by the browser itself, from this site, rather than
 * bundled: webpack ships it as a single-module chunk, and the minifier then
 * reads that chunk as a script and rejects the import.meta.url inside it,
 * so bundling it fails the production build outright. It is also 1.7MB that the
 * bundler has no reason to chew on.
 *
 * public/pdfjs/ holds pdf.min.mjs and its worker, copied from the pdfjs-dist
 * dev dependency. To move to a new version, bump the package and copy both
 * files across together -- a library and a worker of different versions refuse
 * to talk to each other.
 */
const PDFJS_SRC = "/pdfjs/pdf.min.mjs";
const PDFJS_WORKER_SRC = "/pdfjs/pdf.worker.min.mjs";

/** Shipped with the site, so the book works before anything is configured. */
const DEFAULT_PDF = "/catalogue/salt-catalogue.pdf";

/** Width, in pixels, each page is rasterised at. */
const RENDER_WIDTH = 1240;

/** How long a sheet takes to come over. */
const TURN_MS = 760;

/** Spreads either side of the current one kept ready in advance. */
const PREFETCH = 1;

/** Below this width a spread is too narrow to read, so pages come singly. */
const SPREAD_MIN_WIDTH = 768;

/** A4 portrait, until page one has been measured. */
const FALLBACK_ASPECT = 1 / Math.SQRT2;

type Turn = { dir: 1 | -1; armed: boolean };

export default function CatalogueBook({ data }: { data: Data }) {
  const pdfUrl: string = data.pdfUrl || DEFAULT_PDF;
  const downloadLabel: string = data.downloadLabel || "Download Catalogue (PDF)";

  const [total, setTotal] = useState(0);
  const [aspect, setAspect] = useState(FALLBACK_ASPECT);
  const [pages, setPages] = useState<Record<number, string>>({});
  const [spread, setSpread] = useState(0);
  const [perSpread, setPerSpread] = useState(2);
  const [turn, setTurn] = useState<Turn | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [fullscreen, setFullscreen] = useState(false);

  const doc = useRef<any>(null);
  const task = useRef<any>(null);
  const alive = useRef(true);
  const objectUrls = useRef<string[]>([]);
  const queue = useRef<Promise<void>>(Promise.resolve());
  const requested = useRef<Set<number>>(new Set());
  const stage = useRef<HTMLDivElement>(null);

  /* ── Open the document ─────────────────────────────────── */

  useEffect(() => {
    alive.current = true;

    // Both hold one instance created at mount, so capturing them here is the
    // same object the cleanup below would have reached for.
    const urls = objectUrls.current;
    const asked = requested.current;

    (async () => {
      try {
        // webpackIgnore leaves this to the browser, which fetches the path as
        // written. Without it webpack would resolve it at build time and we
        // would be back to bundling pdf.js.
        const pdfjs: any = await import(/* webpackIgnore: true */ PDFJS_SRC);

        pdfjs.GlobalWorkerOptions.workerSrc = PDFJS_WORKER_SRC;

        const loading = pdfjs.getDocument({ url: pdfUrl });
        task.current = loading;

        const loaded = await loading.promise;
        if (!alive.current) {
          loading.destroy();
          return;
        }

        const first = await loaded.getPage(1);
        const view = first.getViewport({ scale: 1 });

        doc.current = loaded;
        setAspect(view.width / view.height);
        setTotal(loaded.numPages);
        setStatus("ready");
      } catch {
        if (alive.current) setStatus("error");
      }
    })();

    return () => {
      alive.current = false;
      task.current?.destroy?.();
      task.current = null;
      doc.current = null;
      urls.forEach((url) => URL.revokeObjectURL(url));
      urls.length = 0;
      asked.clear();
    };
  }, [pdfUrl]);

  /* ── Rasterising ───────────────────────────────────────── */

  const rasterise = useCallback(async (n: number) => {
    const loaded = doc.current;
    if (!loaded || !alive.current) return;

    const page = await loaded.getPage(n);
    const base = page.getViewport({ scale: 1 });
    const view = page.getViewport({ scale: RENDER_WIDTH / base.width });

    const canvas = document.createElement("canvas");
    canvas.width = Math.ceil(view.width);
    canvas.height = Math.ceil(view.height);

    await page.render({ canvas, viewport: view }).promise;

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", 0.88)
    );

    // Dropped as soon as the bitmap is out rather than left to the collector: a
    // full-size canvas per page is the whole memory cost of the book.
    canvas.width = 0;
    canvas.height = 0;
    page.cleanup();

    if (!blob || !alive.current) return;

    const url = URL.createObjectURL(blob);
    objectUrls.current.push(url);
    setPages((prev) => ({ ...prev, [n]: url }));
  }, []);

  // One page at a time. Twenty-six started together would race the reader's own
  // spread for a single CPU and lose.
  const request = useCallback(
    (n: number) => {
      if (n < 1 || n > total || requested.current.has(n)) return;
      requested.current.add(n);
      queue.current = queue.current.then(() => rasterise(n)).catch(() => {});
    },
    [total, rasterise]
  );

  /* ── How many pages fit ────────────────────────────────── */

  // The spread index is kept pointing at the same page across a change of
  // layout, rather than at the same index -- which would move the reader
  // halfway across the book for resizing their window.
  useEffect(() => {
    let current = window.innerWidth >= SPREAD_MIN_WIDTH ? 2 : 1;
    setPerSpread(current);

    const measure = () => {
      const next = window.innerWidth >= SPREAD_MIN_WIDTH ? 2 : 1;
      if (next === current) return;
      const previous = current;
      current = next;
      setPerSpread(next);
      setSpread((index) => Math.floor((index * previous) / next));
    };

    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  const spreadCount = total ? Math.ceil(total / perSpread) : 0;
  const single = perSpread === 1;

  /** The page number in a slot of a spread, or 0 past the end of the book. */
  const pageAt = useCallback(
    (index: number, slot: number) => {
      const n = index * perSpread + slot + 1;
      return n >= 1 && n <= total ? n : 0;
    },
    [perSpread, total]
  );

  useEffect(() => {
    if (!spreadCount) return;
    setSpread((index) => Math.min(index, spreadCount - 1));
  }, [spreadCount]);

  /* ── Keep the current spread and its neighbours ready ──── */

  useEffect(() => {
    if (status !== "ready") return;
    for (let offset = 0; offset <= PREFETCH; offset += 1) {
      const indexes = offset === 0 ? [spread] : [spread + offset, spread - offset];
      for (const index of indexes) {
        if (index < 0 || index >= spreadCount) continue;
        for (let slot = 0; slot < perSpread; slot += 1) request(pageAt(index, slot));
      }
    }
  }, [status, spread, spreadCount, perSpread, pageAt, request]);

  /* ── Turning ───────────────────────────────────────────── */

  const canGo = (dir: 1 | -1) => {
    const target = spread + dir;
    return !turn && target >= 0 && target < spreadCount;
  };

  const go = useCallback(
    (dir: 1 | -1) => {
      if (turn) return;
      const target = spread + dir;
      if (target < 0 || target >= spreadCount) return;
      setTurn({ dir, armed: false });
    },
    [turn, spread, spreadCount]
  );

  const jumpTo = useCallback(
    (index: number) => {
      if (turn || !spreadCount) return;
      setSpread(Math.min(Math.max(index, 0), spreadCount - 1));
    },
    [turn, spreadCount]
  );

  // The sheet is mounted flat and only then given its end angle: a transition
  // between two values painted in the same frame does not run.
  useEffect(() => {
    if (!turn || turn.armed) return;
    const outer = requestAnimationFrame(() =>
      requestAnimationFrame(() => setTurn((t) => (t ? { ...t, armed: true } : t)))
    );
    return () => cancelAnimationFrame(outer);
  }, [turn]);

  useEffect(() => {
    if (!turn?.armed) return;
    const { dir } = turn;
    const timer = setTimeout(() => {
      setSpread((index) => index + dir);
      setTurn(null);
    }, TURN_MS);
    return () => clearTimeout(timer);
  }, [turn]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      // The page slider and any other control handle the arrow keys themselves.
      const tag = (event.target as HTMLElement | null)?.tagName;
      if (tag === "INPUT" || tag === "SELECT" || tag === "TEXTAREA") return;
      if (event.key === "ArrowLeft") go(-1);
      if (event.key === "ArrowRight") go(1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go]);

  /* ── Swipe ─────────────────────────────────────────────── */

  const touch = useRef<{ x: number; y: number } | null>(null);

  const onTouchStart = (event: React.TouchEvent) => {
    const point = event.touches[0];
    touch.current = { x: point.clientX, y: point.clientY };
  };

  const onTouchEnd = (event: React.TouchEvent) => {
    const start = touch.current;
    touch.current = null;
    if (!start) return;
    const point = event.changedTouches[0];
    const dx = point.clientX - start.x;
    // More vertical than horizontal means they were scrolling the page past the
    // book, not turning a leaf of it.
    if (Math.abs(dx) < 50 || Math.abs(point.clientY - start.y) > Math.abs(dx)) return;
    go(dx < 0 ? 1 : -1);
  };

  /* ── Fullscreen ────────────────────────────────────────── */

  const toggleFullscreen = useCallback(() => {
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    else stage.current?.requestFullscreen?.().catch(() => {});
  }, []);

  useEffect(() => {
    const sync = () => setFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", sync);
    return () => document.removeEventListener("fullscreenchange", sync);
  }, []);

  /* ── What goes where ───────────────────────────────────── */

  const target = turn ? spread + turn.dir : spread;

  // Under the turning sheet: the half being left behind stays put, and the half
  // being turned into is already there, so the sheet lands on a finished page.
  // In one-page mode there is no sheet, so the page underneath is the new one
  // and the old one fades out above it.
  const leftPage = single
    ? pageAt(target, 0)
    : pageAt(turn?.dir === -1 ? target : spread, 0);
  const rightPage = pageAt(turn?.dir === 1 ? target : spread, 1);

  const sheetFront = turn ? pageAt(spread, turn.dir === 1 ? 1 : 0) : 0;
  const sheetBack = turn ? pageAt(target, turn.dir === 1 ? 0 : 1) : 0;

  const firstPage = spread * perSpread + 1;
  const lastPage = Math.min(firstPage + perSpread - 1, total);

  const spreadAspect = aspect * perSpread;

  return (
    <section className="py-16 sm:py-20 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        {(data.eyebrow || data.heading || data.description) && (
          <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14">
            {data.eyebrow && (
              <p className="font-label text-xs uppercase tracking-widest text-on-surface-variant mb-3">
                {data.eyebrow}
              </p>
            )}
            {data.heading && (
              <h2 className="font-headline text-4xl lg:text-5xl text-primary">
                {data.heading}
              </h2>
            )}
            {data.description && (
              <p className="font-body text-on-surface-variant leading-relaxed mt-5">
                {data.description}
              </p>
            )}
          </div>
        )}

        <div
          ref={stage}
          className={`relative bg-surface-container-low rounded-2xl p-3 sm:p-6 tonal-shadow ${
            fullscreen ? "flex flex-col justify-center rounded-none" : ""
          }`}
        >
          {status === "error" ? (
            <div className="py-24 text-center">
              <span className="material-symbols-outlined text-5xl text-on-surface-variant/40">
                picture_as_pdf
              </span>
              <p className="font-headline text-xl text-on-surface mt-4 mb-2">
                The catalogue could not be opened here
              </p>
              <p className="font-body text-sm text-on-surface-variant mb-6">
                Download it instead — it is the same document.
              </p>
              <a
                href={pdfUrl}
                download
                className="mineral-glow text-on-primary font-label text-xs uppercase tracking-widest px-7 py-3 rounded-full inline-block"
              >
                {downloadLabel}
              </a>
            </div>
          ) : (
            <>
              {/* The book. Its shape follows the paper's own proportions, and its
                  width is capped by the height of the window, so a spread is
                  never taller than the screen it is read on. */}
              <div
                className="relative mx-auto w-full"
                style={{
                  aspectRatio: `${spreadAspect}`,
                  maxWidth: `calc(${fullscreen ? 80 : 74}vh * ${spreadAspect})`,
                  perspective: "2600px",
                }}
                onTouchStart={onTouchStart}
                onTouchEnd={onTouchEnd}
              >
                <div className="absolute inset-0 flex rounded-lg overflow-hidden shadow-[0_18px_50px_-12px_rgba(0,0,0,0.45)]">
                  <Leaf page={leftPage} pages={pages} single={single} />
                  {!single && <Leaf page={rightPage} pages={pages} single={false} />}
                </div>

                {/* The spine: two sheets of paper meeting in the middle, rather
                    than one wide picture with a seam down it. */}
                {!single && (
                  <div
                    aria-hidden="true"
                    className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-10 pointer-events-none bg-gradient-to-r from-transparent via-black/20 to-transparent"
                  />
                )}

                {/* The sheet coming over. */}
                {turn && !single && (
                  <div
                    aria-hidden="true"
                    className="absolute top-0 bottom-0 w-1/2 z-20"
                    style={{
                      left: turn.dir === 1 ? "50%" : 0,
                      transformStyle: "preserve-3d",
                      transformOrigin: turn.dir === 1 ? "left center" : "right center",
                      transform: `rotateY(${turn.armed ? turn.dir * -180 : 0}deg)`,
                      transition: `transform ${TURN_MS}ms cubic-bezier(0.42, 0.02, 0.32, 1)`,
                    }}
                  >
                    <SheetFace
                      page={sheetFront}
                      pages={pages}
                      spineOn={turn.dir === 1 ? "left" : "right"}
                    />
                    <SheetFace
                      page={sheetBack}
                      pages={pages}
                      spineOn={turn.dir === 1 ? "right" : "left"}
                      flipped
                    />
                    {/* Light rolling off the moving sheet. */}
                    <div className="absolute inset-0 pointer-events-none catalogue-sheet-shade" />
                  </div>
                )}

                {turn && single && (
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 rounded-lg overflow-hidden z-20"
                    style={{
                      opacity: turn.armed ? 0 : 1,
                      transition: `opacity ${TURN_MS}ms ease`,
                    }}
                  >
                    <Leaf page={pageAt(spread, 0)} pages={pages} single />
                  </div>
                )}

                {/* Half the book turns the page it is on, for anyone who treats
                    it like paper. The buttons below do the same thing. */}
                {spreadCount > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={() => go(-1)}
                      disabled={!canGo(-1)}
                      aria-label="Previous page"
                      className="absolute left-0 top-0 bottom-0 w-1/2 z-10 cursor-w-resize disabled:cursor-default"
                    />
                    <button
                      type="button"
                      onClick={() => go(1)}
                      disabled={!canGo(1)}
                      aria-label="Next page"
                      className="absolute right-0 top-0 bottom-0 w-1/2 z-10 cursor-e-resize disabled:cursor-default"
                    />
                  </>
                )}

                {status === "loading" && (
                  <div className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-4 bg-surface-container-low/80 rounded-lg">
                    <svg className="animate-spin h-7 w-7 text-primary" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                      />
                    </svg>
                    <p className="font-label text-xs uppercase tracking-widest text-on-surface-variant">
                      Opening the catalogue
                    </p>
                  </div>
                )}
              </div>

              <div className="mt-5 sm:mt-7 flex flex-col items-center gap-4">
                <div className="flex items-center gap-2 sm:gap-3">
                  <RoundButton
                    icon="first_page"
                    label="First page"
                    onClick={() => jumpTo(0)}
                    disabled={!canGo(-1)}
                  />
                  <RoundButton
                    icon="chevron_left"
                    label="Previous page"
                    onClick={() => go(-1)}
                    disabled={!canGo(-1)}
                  />

                  <span className="font-label text-xs sm:text-sm text-on-surface tabular-nums px-2 min-w-[6.5rem] text-center">
                    {total
                      ? firstPage === lastPage
                        ? `${firstPage} / ${total}`
                        : `${firstPage}–${lastPage} / ${total}`
                      : "— / —"}
                  </span>

                  <RoundButton
                    icon="chevron_right"
                    label="Next page"
                    onClick={() => go(1)}
                    disabled={!canGo(1)}
                  />
                  <RoundButton
                    icon="last_page"
                    label="Last page"
                    onClick={() => jumpTo(spreadCount - 1)}
                    disabled={!canGo(1)}
                  />
                  <RoundButton
                    icon={fullscreen ? "fullscreen_exit" : "fullscreen"}
                    label={fullscreen ? "Leave fullscreen" : "Fullscreen"}
                    onClick={toggleFullscreen}
                  />
                </div>

                {/* Dragging across the whole catalogue, for a reader who knows
                    roughly where in it they want to be. */}
                {spreadCount > 1 && (
                  <input
                    type="range"
                    min={0}
                    max={spreadCount - 1}
                    value={spread}
                    onChange={(event) => jumpTo(Number(event.target.value))}
                    aria-label="Jump to page"
                    className="w-full max-w-md accent-primary cursor-pointer"
                  />
                )}

                <a
                  href={pdfUrl}
                  download
                  className="mineral-glow text-on-primary font-label text-xs uppercase tracking-widest px-7 py-3 rounded-full inline-flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-[18px]">download</span>
                  {downloadLabel}
                </a>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}

/* ── Pieces ────────────────────────────────────────────────── */

/** One page of the book, lying flat. */
function Leaf({
  page,
  pages,
  single,
}: {
  page: number;
  pages: Record<number, string>;
  single: boolean;
}) {
  const url = page ? pages[page] : undefined;

  return (
    <div className={`relative bg-white h-full ${single ? "w-full" : "w-1/2"}`}>
      {url ? (
        // A blob drawn from a canvas: next/image would want to measure and
        // optimise a URL that only exists in this tab.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={url}
          alt={`Catalogue page ${page}`}
          className="w-full h-full object-contain"
          draggable={false}
        />
      ) : (
        page > 0 && <div className="w-full h-full bg-surface-container animate-pulse" />
      )}
    </div>
  );
}

/** One face of the turning sheet. */
function SheetFace({
  page,
  pages,
  spineOn,
  flipped = false,
}: {
  page: number;
  pages: Record<number, string>;
  spineOn: "left" | "right";
  flipped?: boolean;
}) {
  const url = page ? pages[page] : undefined;

  return (
    <div
      className="absolute inset-0 bg-white overflow-hidden"
      style={{
        backfaceVisibility: "hidden",
        WebkitBackfaceVisibility: "hidden",
        transform: flipped ? "rotateY(180deg)" : undefined,
      }}
    >
      {url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={url}
          alt=""
          aria-hidden="true"
          className="w-full h-full object-contain"
          draggable={false}
        />
      )}
      {/* The crease, on whichever edge of this face the spine is. */}
      <div
        className={`absolute inset-y-0 w-6 pointer-events-none ${
          spineOn === "left"
            ? "left-0 bg-gradient-to-r from-black/20 to-transparent"
            : "right-0 bg-gradient-to-l from-black/20 to-transparent"
        }`}
      />
    </div>
  );
}

function RoundButton({
  icon,
  label,
  onClick,
  disabled,
}: {
  icon: string;
  label: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className="w-10 h-10 rounded-full bg-surface-container-lowest tonal-shadow text-on-surface flex items-center justify-center hover:text-primary transition-colors disabled:opacity-35 disabled:hover:text-on-surface"
    >
      <span className="material-symbols-outlined text-[20px]">{icon}</span>
    </button>
  );
}
