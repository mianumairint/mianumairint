"use client";

import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

/**
 * PRODUCT_BANNERS
 * ===============
 * The company's product banners, as the full-screen carousel at the top of the
 * home page. Stacked, fourteen full-width photographs pushed everything else
 * below the fold, so they take turns instead.
 *
 * Slides change with a distortion wipe, matching the transition the company
 * uses on its own site: the two photographs are pushed through a turbulence
 * displacement filter whose strength rises and falls across the change, so one
 * image appears to ripple into the other.
 *
 * The filter is attached only while a slide is changing. feTurbulence is
 * expensive, and leaving it on a full-screen element would cost every frame of
 * every scroll for an effect nobody is looking at.
 *
 * It advances on its own and pauses while the pointer is over it, so a reader
 * is never dragged off the slide they are looking at. Arrows, dots and the
 * left/right keys all drive it.
 */

type Data = Record<string, any>;

const asArray = (value: unknown): any[] => (Array.isArray(value) ? value : []);

/**
 * The incoming slide has to be hidden before the browser paints it, or it
 * flashes at full strength for a frame before the ripple starts. That needs a
 * layout effect, which React does not run while rendering on the server.
 */
const useBeforePaint = typeof window === "undefined" ? useEffect : useLayoutEffect;

const SLIDE_MS = 6000;
const WIPE_MS = 1100;

/** How far pixels are pushed at the peak of the ripple. */
const DISPLACEMENT_PEAK = 110;

/**
 * A whole screen. The carousel is pulled up under the floating header by
 * PageRenderer when it starts a page, so it is the full viewport rather than
 * the viewport minus the header.
 */
const FULL_SCREEN = "h-screen min-h-[520px]";

export default function ProductCarousel({ data }: { data: Data }) {
  const items = asArray(data.items);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [wiping, setWiping] = useState(false);

  // Which photographs have actually arrived. Every slide is a separate remote
  // file, so without this the ripple runs while the new one is still on the
  // wire and all it does is distort the picture it is meant to be replacing.
  const [loaded, setLoaded] = useState<ReadonlySet<string>>(() => new Set());
  const loadedRef = useRef(loaded);
  loadedRef.current = loaded;

  const markLoaded = useCallback((src: string) => {
    setLoaded((previous) => {
      if (previous.has(src)) return previous;
      const next = new Set(previous);
      next.add(src);
      return next;
    });
  }, []);

  const filterId = `distort-${useId().replace(/[:]/g, "")}`;

  // The slide being replaced. It stays on screen underneath while the new one
  // ripples in, so the area never flashes empty mid-change.
  const previous = useRef<Data | null>(null);

  // `items` is rebuilt on every render, so it is read through a ref to keep
  // the callbacks below stable. Depending on the array directly rebuilt them
  // each render, which restarted the timer and meant the carousel never
  // advanced on its own.
  const itemsRef = useRef(items);
  itemsRef.current = items;

  const displacement = useRef<SVGFEDisplacementMapElement>(null);
  const incoming = useRef<HTMLDivElement>(null);
  const frame = useRef<number>();

  const count = items.length;

  /** Runs the ripple and the cross-fade together, frame by frame. */
  const runWipe = useCallback(() => {
    const started = performance.now();
    setWiping(true);

    const step = (now: number) => {
      const t = Math.min((now - started) / WIPE_MS, 1);

      // Up and back down, so the slide is undistorted at both ends.
      displacement.current?.setAttribute(
        "scale",
        String(Math.sin(t * Math.PI) * DISPLACEMENT_PEAK)
      );
      // Held back until the ripple is underway, so the swap happens inside the
      // distortion rather than before it.
      if (incoming.current) {
        incoming.current.style.opacity = String(Math.min(Math.max((t - 0.2) / 0.5, 0), 1));
      }

      if (t < 1) {
        frame.current = requestAnimationFrame(step);
      } else {
        displacement.current?.setAttribute("scale", "0");
        setWiping(false);
      }
    };

    frame.current = requestAnimationFrame(step);
  }, []);

  const advanceTo = useCallback(
    (resolve: (current: number) => number) => {
      setIndex((current) => {
        const next = ((resolve(current) % count) + count) % count;
        if (next === current) return current;
        previous.current = itemsRef.current[current] ?? null;
        return next;
      });
    },
    [count]
  );

  const go = useCallback((next: number) => advanceTo(() => next), [advanceTo]);

  // The wipe is started here rather than from the click, because the incoming
  // slide only exists once the new index has rendered -- and it is a layout
  // effect so the slide is hidden before that render reaches the screen.
  const mounted = useRef(false);

  useBeforePaint(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    if (incoming.current) incoming.current.style.opacity = "0";
    runWipe();
  }, [index, runWipe]);

  useEffect(() => () => cancelAnimationFrame(frame.current ?? 0), []);

  useEffect(() => {
    if (paused || count < 2) return;
    const timer = setInterval(
      () =>
        advanceTo((current) => {
          const next = current + 1;
          const src = itemsRef.current[next % count]?.image;
          // Stay put and try again on the next tick. With the two neighbours
          // preloaded below, this almost never has to.
          return !src || loadedRef.current.has(src) ? next : current;
        }),
      SLIDE_MS
    );
    return () => clearInterval(timer);
  }, [paused, count, advanceTo]);

  useEffect(() => {
    if (count < 2) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") go(index - 1);
      if (event.key === "ArrowRight") go(index + 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [index, count, go]);

  if (!count) return null;

  const current = items[index];
  const behind = previous.current;

  // The slides either side, deduped by source so a repeated photograph is not
  // fetched twice.
  const neighbours =
    count > 1
      ? Array.from(
          new Map(
            [index + 1, index - 1]
              .map((i) => items[((i % count) + count) % count])
              .filter((item: Data) => item?.image && item.image !== current.image)
              .map((item: Data) => [item.image as string, item] as const)
          ).values()
        )
      : [];

  return (
    <section
      className="relative bg-surface-container-lowest overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-roledescription="carousel"
      aria-label={data.heading || "Products"}
    >
      <svg className="absolute w-0 h-0" aria-hidden="true">
        <filter id={filterId} x="-10%" y="-10%" width="120%" height="120%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.012 0.018"
            numOctaves={2}
            seed={7}
            result="noise"
          />
          <feDisplacementMap
            ref={displacement}
            in="SourceGraphic"
            in2="noise"
            scale={0}
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
      </svg>

      <div className={`relative ${FULL_SCREEN}`}>
        <div
          className="absolute inset-0"
          style={wiping ? { filter: `url(#${filterId})` } : undefined}
        >
          {/* The slide being replaced, held still underneath. */}
          {behind?.image && (
            <div className="absolute inset-0">
              <Image
                src={behind.image}
                alt=""
                fill
                sizes="100vw"
                aria-hidden="true"
                className="object-cover"
              />
            </div>
          )}

          {/* The incoming slide. Its opacity is driven imperatively during the
              wipe and deliberately not declared in JSX: React would reset it on
              the re-render that ends the transition, and the slide would vanish
              the moment the ripple finished. */}
          {current.image && (
            <div ref={incoming} className="absolute inset-0">
              {/* A slow drift while the slide is held, so it reads as a
                  photograph being looked at rather than a static billboard. */}
              <motion.div
                key={index}
                className="absolute inset-0"
                initial={{ scale: 1.08 }}
                animate={{ scale: 1 }}
                transition={{ duration: SLIDE_MS / 1000, ease: "linear" }}
              >
                <Image
                  src={current.image}
                  alt={current.title || ""}
                  fill
                  sizes="100vw"
                  priority={index === 0}
                  onLoad={() => markLoaded(current.image)}
                  className="object-cover"
                />
              </motion.div>
            </div>
          )}
        </div>

        {/* Fetched now and parked out of sight, so a change never waits on
            the network. Kept at a pixel rather than hidden outright: a
            display:none image is not guaranteed to be loaded at all. */}
        {neighbours.length > 0 && (
          <div
            aria-hidden="true"
            className="absolute w-px h-px overflow-hidden opacity-0 pointer-events-none"
          >
            {neighbours.map((item: Data) => (
              <Image
                key={item.image}
                src={item.image}
                alt=""
                fill
                sizes="100vw"
                onLoad={() => markLoaded(item.image)}
              />
            ))}
          </div>
        )}

        {/* Above the photographs and outside the filter, so the copy stays
            sharp and legible right through the change. */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/40 to-black/10" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

        <div className="absolute inset-0 flex items-center pointer-events-none">
          <div className="max-w-7xl mx-auto w-full px-6 lg:px-8">
            <motion.div
              key={`copy-${index}`}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.35 }}
              className="max-w-2xl pointer-events-auto"
            >
              {data.eyebrow && (
                <p className="font-label text-[11px] sm:text-xs uppercase tracking-[0.3em] text-white/70 mb-4">
                  {data.eyebrow}
                </p>
              )}
              <h2 className="font-headline text-5xl sm:text-7xl lg:text-8xl leading-[1.02] text-white">
                {current.title}
              </h2>
              {current.subtitle && (
                <p className="font-body text-sm sm:text-lg text-white/80 mt-5 max-w-lg">
                  {current.subtitle}
                </p>
              )}
              {current.href && (
                <Link
                  href={current.href}
                  className="mineral-glow text-on-primary font-label text-sm uppercase tracking-widest px-9 py-3.5 rounded-full inline-block mt-9"
                >
                  {current.ctaLabel || "View Product"}
                </Link>
              )}
            </motion.div>
          </div>
        </div>

        {count > 1 && (
          <>
            <button
              onClick={() => go(index - 1)}
              aria-label="Previous product"
              className="absolute left-3 lg:left-8 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full border border-white/25 bg-black/25 backdrop-blur-sm hover:bg-black/50 text-white flex items-center justify-center transition-colors"
            >
              <span className="material-symbols-outlined">chevron_left</span>
            </button>
            <button
              onClick={() => go(index + 1)}
              aria-label="Next product"
              className="absolute right-3 lg:right-8 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full border border-white/25 bg-black/25 backdrop-blur-sm hover:bg-black/50 text-white flex items-center justify-center transition-colors"
            >
              <span className="material-symbols-outlined">chevron_right</span>
            </button>

            {/* Centred, and shaped the way a phone gallery does it: the slide
                you are on is a bar, everything else is a dot. */}
            <div className="absolute bottom-10 left-0 right-0 px-6">
              <div className="flex flex-col items-center gap-3">
                <div className="flex items-center justify-center gap-2 flex-wrap max-w-full">
                  {items.map((item: Data, i: number) => (
                    <button
                      key={item.title || i}
                      onClick={() => go(i)}
                      aria-label={`Show ${item.title}`}
                      aria-current={i === index}
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        i === index ? "w-8 bg-white" : "w-1.5 bg-white/45 hover:bg-white/75"
                      }`}
                    />
                  ))}
                </div>
                <span className="font-label text-xs text-white/70 tabular-nums">
                  {String(index + 1).padStart(2, "0")} / {String(count).padStart(2, "0")}
                </span>
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
