"use client";

import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";

type Data = Record<string, any>;
const useBeforePaint = typeof window === "undefined" ? useEffect : useLayoutEffect;
const SLIDE_MS = 4500;

/** A ready slide stays visible while the next photograph downloads. Touching
 * controls never leaves autoplay stuck in a synthetic mouse-hover state. */
export default function ProductCarousel({ data }: { data: Data }) {
  const items: Data[] = Array.isArray(data.items) ? data.items : [];
  const count = items.length;
  const itemsRef = useRef(items);
  itemsRef.current = items;
  const [index, setIndex] = useState(0);
  const [pendingIndex, setPendingIndex] = useState<number | null>(null);
  const [loaded, setLoaded] = useState<ReadonlySet<string>>(() => new Set());
  const [failed, setFailed] = useState<ReadonlySet<string>>(() => new Set());
  const [wiping, setWiping] = useState(false);
  const [userPaused, setUserPaused] = useState(false);
  const [keyboardFocus, setKeyboardFocus] = useState(false);
  const [visible, setVisible] = useState(true);
  const [inView, setInView] = useState(true);
  const [mobile, setMobile] = useState(true);
  const reducedMotion = useReducedMotion();
  const root = useRef<HTMLElement>(null);
  const previous = useRef<Data | null>(null);
  const incoming = useRef<HTMLDivElement>(null);
  const displacement = useRef<SVGFEDisplacementMapElement>(null);
  const frame = useRef<number>();
  const filterId = `distort-${useId().replace(/:/g, "")}`;
  // Reduced motion only removes the wipe/zoom effects; it must not stop
  // autoplay. Many Android phones (e.g. Oppo/ColorOS with animations turned
  // off) report it, which used to freeze the carousel on the first slide.
  const paused = userPaused || keyboardFocus || !visible || !inView;

  useEffect(() => {
    const query = window.matchMedia("(max-width: 767px)");
    const updateSize = () => setMobile(query.matches);
    const updateVisibility = () => setVisible(!document.hidden);
    updateSize();
    updateVisibility();
    query.addEventListener("change", updateSize);
    document.addEventListener("visibilitychange", updateVisibility);
    const observer = typeof IntersectionObserver === "undefined" ? null : new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting), { threshold: 0.1 }
    );
    if (root.current) observer?.observe(root.current);
    return () => {
      query.removeEventListener("change", updateSize);
      document.removeEventListener("visibilitychange", updateVisibility);
      observer?.disconnect();
      cancelAnimationFrame(frame.current ?? 0);
    };
  }, []);

  const markLoaded = useCallback((src: string) => {
    setLoaded((old) => old.has(src) ? old : new Set([...old, src]));
  }, []);
  const markFailed = useCallback((src: string) => {
    setFailed((old) => old.has(src) ? old : new Set([...old, src]));
  }, []);

  const playableIndex = useCallback((next: number) => {
    for (let step = 0; step < count; step++) {
      const candidate = ((next + step) % count + count) % count;
      const src = itemsRef.current[candidate]?.image;
      if (!src || !failed.has(src)) return candidate;
    }
    return null;
  }, [count, failed]);

  const go = useCallback((next: number) => {
    const candidate = playableIndex(next);
    setPendingIndex(candidate === index ? null : candidate);
  }, [index, playableIndex]);

  // If a timer expires while an image is downloading, its onLoad commits the
  // pending slide immediately, instead of waiting another complete interval.
  useEffect(() => {
    if (pendingIndex === null || wiping) return;
    const src = itemsRef.current[pendingIndex]?.image;
    if (src && failed.has(src)) {
      go(pendingIndex + 1);
    } else if (!src || loaded.has(src)) {
      previous.current = itemsRef.current[index] ?? null;
      setIndex(pendingIndex);
      setPendingIndex(null);
    }
  }, [pendingIndex, loaded, failed, wiping, index, go]);

  useEffect(() => {
    if (count > 1 && failed.has(itemsRef.current[index]?.image) && pendingIndex === null) go(index + 1);
  }, [failed, count, index, pendingIndex, go]);

  const runWipe = useCallback(() => {
    cancelAnimationFrame(frame.current ?? 0);
    if (reducedMotion) {
      if (incoming.current) incoming.current.style.opacity = "1";
      setWiping(false);
      return;
    }
    const duration = mobile ? 850 : 1000;
    const peak = mobile ? 45 : 110;
    const started = performance.now();
    setWiping(true);
    const step = (now: number) => {
      const t = Math.min((now - started) / duration, 1);
      displacement.current?.setAttribute("scale", String(Math.sin(t * Math.PI) * peak));
      if (incoming.current) incoming.current.style.opacity = String(Math.min(Math.max((t - 0.15) / 0.65, 0), 1));
      if (t < 1) frame.current = requestAnimationFrame(step);
      else {
        displacement.current?.setAttribute("scale", "0");
        if (incoming.current) incoming.current.style.opacity = "1";
        setWiping(false);
      }
    };
    frame.current = requestAnimationFrame(step);
  }, [mobile, reducedMotion]);

  const displayedIndex = useRef(index);
  useBeforePaint(() => {
    if (displayedIndex.current === index) return;
    displayedIndex.current = index;
    if (incoming.current) incoming.current.style.opacity = "0";
    runWipe();
  }, [index, runWipe]);

  const current = items[index];
  const currentReady = !current?.image || loaded.has(current.image);
  useEffect(() => {
    if (count < 2 || paused || wiping || pendingIndex !== null || !currentReady) return;
    const timer = setTimeout(() => go(index + 1), SLIDE_MS);
    return () => clearTimeout(timer);
  }, [index, count, paused, wiping, pendingIndex, currentReady, go]);

  if (!count) return null;
  const behind = previous.current;
  const nextIndex = playableIndex(index + 1);
  const preloads = Array.from(new Set([nextIndex, pendingIndex]))
    .filter((i): i is number => i !== null && i !== index)
    .map((i) => items[i])
    .filter((item) => item?.image && item.image !== current.image && !failed.has(item.image));

  return (
    <section
      ref={root}
      className="product-carousel relative bg-surface-container-lowest overflow-hidden"
      aria-roledescription="carousel"
      aria-label={data.heading || "Products"}
      aria-busy={pendingIndex !== null}
      onFocusCapture={(event) => setKeyboardFocus(event.target.matches(":focus-visible"))}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setKeyboardFocus(false);
      }}
      onKeyDown={(event) => {
        if (event.target instanceof HTMLElement && event.target.closest("input,textarea,select")) return;
        if (event.key === "ArrowLeft") { event.preventDefault(); go(index - 1); }
        if (event.key === "ArrowRight") { event.preventDefault(); go(index + 1); }
      }}
    >
      <svg className="absolute w-0 h-0" aria-hidden="true">
        <defs>
          <filter id={filterId} x="-10%" y="-10%" width="120%" height="120%">
            <feTurbulence type="fractalNoise" baseFrequency="0.012 0.018" numOctaves={mobile ? 1 : 2} seed={7} result="noise" />
            <feDisplacementMap ref={displacement} in="SourceGraphic" in2="noise" scale={0} xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </defs>
      </svg>
      <div className="relative min-h-[60svh] md:h-screen md:min-h-[520px]">
        <div className="absolute inset-0" style={wiping && !reducedMotion ? { filter: `url(#${filterId})`, willChange: "filter" } : undefined}>
          {behind?.image && (
            <div className="absolute inset-0">
              <Image src={behind.image} alt="" fill sizes="100vw" aria-hidden="true" className="object-cover" />
            </div>
          )}
          {current.image && (
            <div ref={incoming} className="absolute inset-0">
              <motion.div key={index} className="absolute inset-0" initial={{ scale: reducedMotion || mobile ? 1 : 1.04 }} animate={{ scale: 1 }} transition={{ duration: SLIDE_MS / 1000, ease: "linear" }}>
                <Image src={current.image} alt={current.title || ""} fill sizes="100vw" priority={index === 0} onLoad={() => markLoaded(current.image)} onError={() => markFailed(current.image)} className="object-cover" />
              </motion.div>
            </div>
          )}
        </div>
        {preloads.length > 0 && (
          <div aria-hidden="true" className="absolute w-px h-px overflow-hidden opacity-0 pointer-events-none">
            {preloads.map((item) => (
              <Image key={item.image} src={item.image} alt="" fill sizes="100vw" loading="eager" fetchPriority={pendingIndex !== null ? "high" : "low"} onLoad={() => markLoaded(item.image)} onError={() => markFailed(item.image)} />
            ))}
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/40 to-black/10" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        <div className="relative flex min-h-[60svh] items-center pt-7 pb-24 md:absolute md:inset-0 md:min-h-0 md:py-20 pointer-events-none">
          <div className="max-w-7xl mx-auto w-full px-4 md:px-20 lg:px-24">
            <motion.div key={`copy-${index}`} dir="auto" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: reducedMotion ? 0 : 0.45 }} className="hero-copy min-w-0 max-w-[85%] md:max-w-2xl pointer-events-auto">
              {data.eyebrow && <p className="font-label text-[10px] sm:text-xs uppercase tracking-[0.2em] text-white/70 mb-2 md:mb-4"><span>{data.eyebrow}</span></p>}
              <h2 className="font-headline text-[clamp(1.35rem,5vw,2.25rem)] md:text-6xl lg:text-7xl xl:text-8xl leading-[1.12] text-white"><span>{current.title}</span></h2>
              {current.subtitle && <p className="font-body text-[11px] md:text-lg text-white/80 mt-2 md:mt-5 max-w-lg"><span>{current.subtitle}</span></p>}
              {current.href && <Link href={current.href} className="mineral-glow text-on-primary font-label text-xs md:text-sm uppercase tracking-widest px-6 md:px-9 py-3 md:py-3.5 rounded-full inline-block mt-4 md:mt-9"><span>{current.ctaLabel || "View Product"}</span></Link>}
            </motion.div>
          </div>
        </div>
        {count > 1 && (
          <div className="notranslate" translate="no" dir="ltr">
            <button onClick={() => go(index - 1)} aria-label="Previous product" className="absolute left-4 bottom-4 md:bottom-auto md:left-3 lg:left-8 md:top-1/2 md:-translate-y-1/2 w-11 h-11 md:w-12 md:h-12 rounded-full border border-white/25 bg-black/25 backdrop-blur-sm hover:bg-black/50 text-white flex items-center justify-center">
              <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6"><path d="m14 6-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
            <button onClick={() => go(index + 1)} aria-label="Next product" className="absolute right-4 bottom-4 md:bottom-auto md:right-3 lg:right-8 md:top-1/2 md:-translate-y-1/2 w-11 h-11 md:w-12 md:h-12 rounded-full border border-white/25 bg-black/25 backdrop-blur-sm hover:bg-black/50 text-white flex items-center justify-center">
              <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6"><path d="m10 6 6 6-6 6" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
            <div className="absolute bottom-3 md:bottom-8 left-16 right-16 md:left-20 md:right-20">
              <div className="flex flex-col items-center gap-1">
                <div className="flex items-center justify-center gap-1 flex-wrap max-w-full">
                  {items.map((item, i) => <button key={i} onClick={() => go(i)} aria-label={`Show ${item.title}`} aria-current={i === index} className={`h-5 flex items-center justify-center ${i === index ? "w-8" : "w-3"}`}><span className={`h-1.5 rounded-full transition-all ${i === index ? "w-8 bg-white" : "w-1.5 bg-white/50"}`} /></button>)}
                </div>
                <div className="flex items-center gap-2 text-white/80">
                  <span className="font-label text-xs tabular-nums">{String(index + 1).padStart(2, "0")} / {String(count).padStart(2, "0")}</span>
                  <button onClick={() => { setUserPaused((old) => !old); setKeyboardFocus(false); }} aria-label={userPaused ? "Resume slideshow" : "Pause slideshow"} aria-pressed={userPaused} className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-white/15">
                    <svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">{userPaused ? <path d="m8 5 11 7-11 7V5Z" /> : <path d="M6 5h4v14H6zm8 0h4v14h-4z" />}</svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
