import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router';
import { ArrowRight, ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';

// Cloudinary resizes on the fly: insert a transformation after "/upload/".
// f_auto = WebP/AVIF for browsers that support them, q_auto = smallest size that still looks good.
const sized = (url, width) => url.replace('/image/upload/', `/image/upload/c_fill,g_auto,w_${width},h_${Math.round(width / 2.4)},f_auto,q_auto/`);
const WIDTHS = [640, 1024, 1600, 2400];

const prefersReducedMotion = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;

// The home page banner: image slides from the CMS (admin → Content → Home page banner).
//
//   - Changes slide every `intervalSeconds`, but PAUSES while the pointer is over it or a button
//     inside it has keyboard focus (nobody wants the text to move while reading or clicking),
//     while the tab is hidden, and never starts on its own for "reduce motion" users.
//   - A Pause/Play button: content that moves by itself for more than 5 seconds must be
//     stoppable (WCAG 2.2.2).
//   - Arrows, dots, keyboard (← →) and swipe on phones.
//   - Only the first image loads straight away; the others load lazily.
export function HeroCarousel({ slides, intervalSeconds }) {
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(() => !prefersReducedMotion());
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [tabHidden, setTabHidden] = useState(() => document.hidden);
  const touchStart = useRef(null);
  const count = slides.length;

  const go = (next) => setIndex((next + count) % count);

  useEffect(() => {
    const onVisibility = () => setTabHidden(document.hidden);
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, []);

  // Auto-advance. Restarts the timer after every change, so a manual click gets a full interval.
  const running = playing && !hovered && !focused && !tabHidden && count > 1;
  useEffect(() => {
    if (!running) return;
    const timer = setTimeout(() => setIndex((i) => (i + 1) % count), intervalSeconds * 1000);
    return () => clearTimeout(timer);
  }, [running, index, count, intervalSeconds]);

  // The admin removed slides while someone is looking: stay in range.
  const current = Math.min(index, count - 1);

  const onKeyDown = (e) => {
    if (e.key === 'ArrowLeft') go(current - 1);
    if (e.key === 'ArrowRight') go(current + 1);
  };
  const onTouchEnd = (e) => {
    if (touchStart.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStart.current;
    touchStart.current = null;
    if (Math.abs(dx) > 50) go(current + (dx < 0 ? 1 : -1)); // a real swipe, not a tap
  };

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Featured"
      className="relative h-[420px] overflow-hidden rounded-3xl bg-night text-white md:h-[480px]"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setFocused(true)}
      onBlur={(e) => !e.currentTarget.contains(e.relatedTarget) && setFocused(false)}
      onKeyDown={onKeyDown}
      onTouchStart={(e) => (touchStart.current = e.touches[0].clientX)}
      onTouchEnd={onTouchEnd}
    >
      {/* Every slide is stacked; only the current one is visible (a cross-fade, off for reduce motion). */}
      {slides.map((slide, i) => {
        const active = i === current;
        return (
          <div
            key={slide.imageUrl + i}
            role="group"
            aria-roledescription="slide"
            aria-label={`${i + 1} of ${count}`}
            aria-hidden={!active}
            inert={!active ? true : undefined}
            className={`absolute inset-0 transition-opacity duration-700 motion-reduce:transition-none ${active ? 'opacity-100' : 'opacity-0'}`}
          >
            <img
              src={sized(slide.imageUrl, 1600)}
              srcSet={WIDTHS.map((w) => `${sized(slide.imageUrl, w)} ${w}w`).join(', ')}
              sizes="(min-width: 1280px) 1248px, 100vw"
              alt={slide.imageAlt}
              loading={i === 0 ? 'eager' : 'lazy'}
              fetchPriority={i === 0 ? 'high' : 'low'}
              className="absolute inset-0 size-full object-cover"
            />
            {/* Dark fade from the left, so white text is readable on any photo */}
            <div className="absolute inset-0 bg-gradient-to-r from-night/85 via-night/50 to-transparent" />
            <div className="relative flex h-full max-w-xl flex-col justify-center px-8 pb-10 md:px-14">
              {slide.eyebrow && (
                <p className="text-sm font-medium uppercase tracking-widest text-white/80">{slide.eyebrow}</p>
              )}
              <h2 className="mt-3 text-3xl font-bold leading-tight md:text-5xl">{slide.title}</h2>
              {slide.text && <p className="mt-4 text-white/85">{slide.text}</p>}
              {slide.buttonLabel && slide.buttonLink && (
                <Link
                  to={slide.buttonLink}
                  className="mt-8 inline-flex w-fit items-center gap-2 rounded-lg bg-white px-5 py-3 font-medium text-night hover:bg-white/85"
                >
                  {slide.buttonLabel} <ArrowRight className="size-4" />
                </Link>
              )}
            </div>
          </div>
        );
      })}

      {count > 1 && (
        <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-3 px-4 pb-4 md:px-6">
          <div className="flex items-center gap-2">
            <ControlButton label={playing ? 'Pause slides' : 'Play slides'} onClick={() => setPlaying((p) => !p)}>
              {playing ? <Pause className="size-4" /> : <Play className="size-4" />}
            </ControlButton>
            <div className="flex items-center gap-1.5">
              {slides.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => go(i)}
                  aria-label={`Show slide ${i + 1}`}
                  aria-current={i === current}
                  // A 24px tap target around a small visible dot
                  className="group flex size-6 items-center justify-center"
                >
                  <span
                    className={`block h-2 rounded-full transition-all motion-reduce:transition-none ${i === current ? 'w-6 bg-white' : 'w-2 bg-white/50 group-hover:bg-white/80'}`}
                  />
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-2">
            <ControlButton label="Previous slide" onClick={() => go(current - 1)}>
              <ChevronLeft className="size-5" />
            </ControlButton>
            <ControlButton label="Next slide" onClick={() => go(current + 1)}>
              <ChevronRight className="size-5" />
            </ControlButton>
          </div>
        </div>
      )}
    </section>
  );
}

function ControlButton({ label, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className="flex size-10 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur hover:bg-white/30 focus-visible:outline-2 focus-visible:outline-white"
    >
      {children}
    </button>
  );
}
