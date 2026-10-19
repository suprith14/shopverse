// import = bring in code from another file or package
// useTranslation = gives t() for text in the reader's language (English/Kannada)
import { useTranslation } from 'react-i18next';
// import = bring in code from another file or package
// useEffect = run code AFTER the screen is drawn (timers, events, browser APIs); re-runs when its [deps] change
// useRef = a box (.current) that keeps a value or a DOM element without causing a redraw
// useState = a value the component remembers; calling its setter redraws the component
import { useEffect, useRef, useState } from 'react';
// import = bring in code from another file or package
// Link = a link to another page of this app (no full page reload)
import { Link } from 'react-router';
// import = bring in code from another file or package
import { ArrowRight, ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';

// Cloudinary resizes on the fly: insert a transformation after "/upload/".
// f_auto = WebP/AVIF for browsers that support them, q_auto = smallest size that still looks good.
// const = a name for a value that is never reassigned
// => = an arrow function (a short function)
// `text ${x}` = a template string: text with values inserted
// Math = number helpers (min, max, round, floor...)
const sized = (url, width) => url.replace('/image/upload/', `/image/upload/c_fill,g_auto,w_${width},h_${Math.round(width / 2.4)},f_auto,q_auto/`);
// const = a name for a value that is never reassigned
const WIDTHS = [640, 1024, 1600, 2400];

// const = a name for a value that is never reassigned
// => = an arrow function (a short function)
// ?. = optional chaining: stop (undefined) instead of crashing if the left side is null/undefined
// ?.() = call only if the function exists
// window = the browser tab (location, events, timers)
// matchMedia = check a CSS media query in JS, e.g. dark mode or reduced motion
// a ?? b = a, unless a is null/undefined, then b
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
// export = other files can import this
// function Name() = a React component (capital letter): returns what to show (JSX)
// { a, b } = destructuring: take properties a and b out of an object
export function HeroCarousel({ slides, intervalSeconds }) {
  // const = a name for a value that is never reassigned
  // { a, b } = destructuring: take properties a and b out of an object
  // t('key') = the text for this key in the current language (from i18n/en.js or kn.js)
  // useTranslation = gives t() for text in the reader's language (English/Kannada)
  const { t } = useTranslation();
  // const = a name for a value that is never reassigned
  // [a, b] = destructuring: take the first and second items of an array
  // useState = a value the component remembers; calling its setter redraws the component
  const [index, setIndex] = useState(0);
  // const = a name for a value that is never reassigned
  // [a, b] = destructuring: take the first and second items of an array
  // useState = a value the component remembers; calling its setter redraws the component
  // => = an arrow function (a short function)
  // ! = NOT: flips true/false
  const [playing, setPlaying] = useState(() => !prefersReducedMotion());
  // const = a name for a value that is never reassigned
  // [a, b] = destructuring: take the first and second items of an array
  // useState = a value the component remembers; calling its setter redraws the component
  const [hovered, setHovered] = useState(false);
  // const = a name for a value that is never reassigned
  // [a, b] = destructuring: take the first and second items of an array
  // useState = a value the component remembers; calling its setter redraws the component
  const [focused, setFocused] = useState(false);
  // const = a name for a value that is never reassigned
  // [a, b] = destructuring: take the first and second items of an array
  // useState = a value the component remembers; calling its setter redraws the component
  // => = an arrow function (a short function)
  // document = the current web page (its HTML elements)
  const [tabHidden, setTabHidden] = useState(() => document.hidden);
  // const = a name for a value that is never reassigned
  // useRef = a box (.current) that keeps a value or a DOM element without causing a redraw
  const touchStart = useRef(null);
  // const = a name for a value that is never reassigned
  const count = slides.length;

  // const = a name for a value that is never reassigned
  // => = an arrow function (a short function)
  const go = (next) => setIndex((next + count) % count);

  // useEffect = run code AFTER the screen is drawn (timers, events, browser APIs); re-runs when its [deps] change
  // => = an arrow function (a short function)
  useEffect(() => {
    // const = a name for a value that is never reassigned
    // => = an arrow function (a short function)
    // document = the current web page (its HTML elements)
    const onVisibility = () => setTabHidden(document.hidden);
    // document = the current web page (its HTML elements)
    // addEventListener = run a function when an event happens
    document.addEventListener('visibilitychange', onVisibility);
    // return = give this value back and stop the function here
    // => = an arrow function (a short function)
    // document = the current web page (its HTML elements)
    // removeEventListener = stop listening (cleanup)
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, []);

  // Auto-advance. Restarts the timer after every change, so a manual click gets a full interval.
  // const = a name for a value that is never reassigned
  // ! = NOT: flips true/false
  // a && b = AND; in JSX: show b only when a is true
  const running = playing && !hovered && !focused && !tabHidden && count > 1;
  // useEffect = run code AFTER the screen is drawn (timers, events, browser APIs); re-runs when its [deps] change
  // => = an arrow function (a short function)
  useEffect(() => {
    // if (...) = run the next part only when the condition is true
    // ! = NOT: flips true/false
    // return = give this value back and stop the function here
    if (!running) return;
    // const = a name for a value that is never reassigned
    // setTimeout = run a function once after a delay (ms)
    // => = an arrow function (a short function)
    const timer = setTimeout(() => setIndex((i) => (i + 1) % count), intervalSeconds * 1000);
    // return = give this value back and stop the function here
    // => = an arrow function (a short function)
    // clearTimeout = cancel a setTimeout
    return () => clearTimeout(timer);
  }, [running, index, count, intervalSeconds]);

  // The admin removed slides while someone is looking: stay in range.
  // const = a name for a value that is never reassigned
  // Math = number helpers (min, max, round, floor...)
  const current = Math.min(index, count - 1);

  // const = a name for a value that is never reassigned
  // onKeyDown = runs when a key is pressed
  // => = an arrow function (a short function)
  const onKeyDown = (e) => {
    // if (...) = run the next part only when the condition is true
    // === = strictly equal (same value AND same type)
    if (e.key === 'ArrowLeft') go(current - 1);
    // if (...) = run the next part only when the condition is true
    // === = strictly equal (same value AND same type)
    if (e.key === 'ArrowRight') go(current + 1);
  };
  // const = a name for a value that is never reassigned
  // onTouchEnd = the finger lifted
  // => = an arrow function (a short function)
  const onTouchEnd = (e) => {
    // if (...) = run the next part only when the condition is true
    // === = strictly equal (same value AND same type)
    // return = give this value back and stop the function here
    if (touchStart.current === null) return;
    // const = a name for a value that is never reassigned
    const dx = e.changedTouches[0].clientX - touchStart.current;
    touchStart.current = null;
    // if (...) = run the next part only when the condition is true
    // Math = number helpers (min, max, round, floor...)
    // a ? b : c = ternary: if a then b else c
    if (Math.abs(dx) > 50) go(current + (dx < 0 ? 1 : -1)); // a real swipe, not a tap
  };

  // return = give this value back and stop the function here
  return (
    // <section> = a themed part of the page with its own heading
    <section
      // aria-roledescription = a custom name for the role (e.g. "carousel")
      aria-roledescription="carousel"
      // aria-label = the name screen readers read for this element
      // { } in JSX = run JavaScript here and show its result
      // t('key') = the text for this key in the current language (from i18n/en.js or kn.js)
      aria-label={t('carousel.label')}
      // className = CSS classes (Tailwind) for this element (class is a JS keyword)
      className="relative h-[420px] overflow-hidden rounded-3xl bg-night text-white md:h-[480px]"
      // onMouseEnter = the pointer moved over the element
      // { } in JSX = run JavaScript here and show its result
      // => = an arrow function (a short function)
      onMouseEnter={() => setHovered(true)}
      // onMouseLeave = the pointer left the element
      // { } in JSX = run JavaScript here and show its result
      // => = an arrow function (a short function)
      onMouseLeave={() => setHovered(false)}
      // onFocus = runs when the element gets keyboard focus
      // { } in JSX = run JavaScript here and show its result
      // => = an arrow function (a short function)
      onFocus={() => setFocused(true)}
      // onBlur = runs when focus leaves the element
      // { } in JSX = run JavaScript here and show its result
      // => = an arrow function (a short function)
      // ! = NOT: flips true/false
      // a && b = AND; in JSX: show b only when a is true
      onBlur={(e) => !e.currentTarget.contains(e.relatedTarget) && setFocused(false)}
      // onKeyDown = runs when a key is pressed
      // { } in JSX = run JavaScript here and show its result
      onKeyDown={onKeyDown}
      // onTouchStart = a finger touched the screen
      // { } in JSX = run JavaScript here and show its result
      // => = an arrow function (a short function)
      onTouchStart={(e) => (touchStart.current = e.touches[0].clientX)}
      // onTouchEnd = the finger lifted
      // { } in JSX = run JavaScript here and show its result
      onTouchEnd={onTouchEnd}
    >
      {/* Every slide is stacked; only the current one is visible (a cross-fade, off for reduce motion). */}
      {/* { } in JSX = run JavaScript here and show its result
         .map = make a new array by transforming each item (in JSX: one element per item)
         => = an arrow function (a short function) */}
      {slides.map((slide, i) => {
        // const = a name for a value that is never reassigned
        // === = strictly equal (same value AND same type)
        const active = i === current;
        // return = give this value back and stop the function here
        return (
          <div
            // key = a stable id for list items so React can track them between redraws
            // { } in JSX = run JavaScript here and show its result
            key={slide.imageUrl + i}
            // role = tells screen readers what this element is (status, tab, group...)
            role="group"
            // aria-roledescription = a custom name for the role (e.g. "carousel")
            aria-roledescription="slide"
            // aria-label = the name screen readers read for this element
            // { } in JSX = run JavaScript here and show its result
            // t('key') = the text for this key in the current language (from i18n/en.js or kn.js)
            aria-label={t('carousel.position', { number: i + 1, total: count })}
            // aria-hidden = screen readers skip this (decoration)
            // { } in JSX = run JavaScript here and show its result
            // ! = NOT: flips true/false
            aria-hidden={!active}
            // inert = can't be focused or clicked (hidden slides)
            // { } in JSX = run JavaScript here and show its result
            // a ? b : c = ternary: if a then b else c
            // ! = NOT: flips true/false
            inert={!active ? true : undefined}
            // className = CSS classes (Tailwind) for this element (class is a JS keyword)
            // { } in JSX = run JavaScript here and show its result
            // `text ${x}` = a template string: text with values inserted
            // a ? b : c = ternary: if a then b else c
            className={`absolute inset-0 transition-opacity duration-700 motion-reduce:transition-none ${active ? 'opacity-100' : 'opacity-0'}`}
          >
            <img
              // { } in JSX = run JavaScript here and show its result
              src={sized(slide.imageUrl, 1600)}
              // srcSet = several image sizes; the browser downloads the best one for the screen
              // { } in JSX = run JavaScript here and show its result
              // .map = make a new array by transforming each item (in JSX: one element per item)
              // => = an arrow function (a short function)
              // `text ${x}` = a template string: text with values inserted
              // .join = turn an array into one string with a separator
              srcSet={WIDTHS.map((w) => `${sized(slide.imageUrl, w)} ${w}w`).join(', ')}
              // sizes = how wide the image will be drawn, so srcSet can pick a size
              sizes="(min-width: 1280px) 1248px, 100vw"
              // alt = text describing the image for screen readers (empty = decorative)
              // { } in JSX = run JavaScript here and show its result
              alt={slide.imageAlt}
              // loading="lazy" = load the image only when it gets near the screen
              // { } in JSX = run JavaScript here and show its result
              // a ? b : c = ternary: if a then b else c
              // === = strictly equal (same value AND same type)
              loading={i === 0 ? 'eager' : 'lazy'}
              // { } in JSX = run JavaScript here and show its result
              // a ? b : c = ternary: if a then b else c
              // === = strictly equal (same value AND same type)
              fetchPriority={i === 0 ? 'high' : 'low'}
              // className = CSS classes (Tailwind) for this element (class is a JS keyword)
              className="absolute inset-0 size-full object-cover"
            />
            {/* Dark fade from the left, so white text is readable on any photo */}
            {/* className = CSS classes (Tailwind) for this element (class is a JS keyword) */}
            <div className="absolute inset-0 bg-gradient-to-r from-night/85 via-night/50 to-transparent" />
            {/* className = CSS classes (Tailwind) for this element (class is a JS keyword) */}
            <div className="relative flex h-full max-w-xl flex-col justify-center px-8 pb-10 md:px-14">
              {/* { } in JSX = run JavaScript here and show its result
                 a && b = AND; in JSX: show b only when a is true */}
              {slide.eyebrow && (
                // className = CSS classes (Tailwind) for this element (class is a JS keyword)
                // { } in JSX = run JavaScript here and show its result
                <p className="text-sm font-medium uppercase tracking-widest text-white/80">{slide.eyebrow}</p>
              )}
              {/* className = CSS classes (Tailwind) for this element (class is a JS keyword)
                 { } in JSX = run JavaScript here and show its result */}
              <h2 className="mt-3 text-3xl font-bold leading-tight md:text-5xl">{slide.title}</h2>
              {/* { } in JSX = run JavaScript here and show its result
                 a && b = AND; in JSX: show b only when a is true
                 className = CSS classes (Tailwind) for this element (class is a JS keyword) */}
              {slide.text && <p className="mt-4 text-white/85">{slide.text}</p>}
              {/* { } in JSX = run JavaScript here and show its result
                 a && b = AND; in JSX: show b only when a is true */}
              {slide.buttonLabel && slide.buttonLink && (
                // Link = a link to another page of this app (no full page reload)
                <Link
                  // { } in JSX = run JavaScript here and show its result
                  to={slide.buttonLink}
                  // className = CSS classes (Tailwind) for this element (class is a JS keyword)
                  className="mt-8 inline-flex w-fit items-center gap-2 rounded-lg bg-white px-5 py-3 font-medium text-night hover:bg-white/85"
                >
                  {/* { } in JSX = run JavaScript here and show its result
                     className = CSS classes (Tailwind) for this element (class is a JS keyword) */}
                  {slide.buttonLabel} <ArrowRight className="size-4" />
                </Link>
              )}
            </div>
          </div>
        );
      })}

      {/* { } in JSX = run JavaScript here and show its result
         a && b = AND; in JSX: show b only when a is true */}
      {count > 1 && (
        // className = CSS classes (Tailwind) for this element (class is a JS keyword)
        <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-3 px-4 pb-4 md:px-6">
          {/* className = CSS classes (Tailwind) for this element (class is a JS keyword) */}
          <div className="flex items-center gap-2">
            {/* { } in JSX = run JavaScript here and show its result
               a ? b : c = ternary: if a then b else c
               t('key') = the text for this key in the current language (from i18n/en.js or kn.js)
               onClick = what happens on click/tap
               => = an arrow function (a short function)
               ! = NOT: flips true/false */}
            <ControlButton label={playing ? t('carousel.pause') : t('carousel.play')} onClick={() => setPlaying((p) => !p)}>
              {/* { } in JSX = run JavaScript here and show its result
                 a ? b : c = ternary: if a then b else c
                 className = CSS classes (Tailwind) for this element (class is a JS keyword) */}
              {playing ? <Pause className="size-4" /> : <Play className="size-4" />}
            </ControlButton>
            {/* className = CSS classes (Tailwind) for this element (class is a JS keyword) */}
            <div className="flex items-center gap-1.5">
              {/* { } in JSX = run JavaScript here and show its result
                 .map = make a new array by transforming each item (in JSX: one element per item)
                 => = an arrow function (a short function) */}
              {slides.map((_, i) => (
                <button
                  // key = a stable id for list items so React can track them between redraws
                  // { } in JSX = run JavaScript here and show its result
                  key={i}
                  type="button"
                  // onClick = what happens on click/tap
                  // { } in JSX = run JavaScript here and show its result
                  // => = an arrow function (a short function)
                  onClick={() => go(i)}
                  // aria-label = the name screen readers read for this element
                  // { } in JSX = run JavaScript here and show its result
                  // t('key') = the text for this key in the current language (from i18n/en.js or kn.js)
                  aria-label={t('carousel.show', { number: i + 1 })}
                  // aria-current = marks the current page/step/item
                  // { } in JSX = run JavaScript here and show its result
                  // === = strictly equal (same value AND same type)
                  aria-current={i === current}
                  // A 24px tap target around a small visible dot
                  // className = CSS classes (Tailwind) for this element (class is a JS keyword)
                  className="group flex size-6 items-center justify-center"
                >
                  <span
                    // className = CSS classes (Tailwind) for this element (class is a JS keyword)
                    // { } in JSX = run JavaScript here and show its result
                    // `text ${x}` = a template string: text with values inserted
                    // a ? b : c = ternary: if a then b else c
                    // === = strictly equal (same value AND same type)
                    className={`block h-2 rounded-full transition-all motion-reduce:transition-none ${i === current ? 'w-6 bg-white' : 'w-2 bg-white/50 group-hover:bg-white/80'}`}
                  />
                </button>
              ))}
            </div>
          </div>
          {/* className = CSS classes (Tailwind) for this element (class is a JS keyword) */}
          <div className="flex gap-2">
            {/* { } in JSX = run JavaScript here and show its result
               t('key') = the text for this key in the current language (from i18n/en.js or kn.js)
               onClick = what happens on click/tap
               => = an arrow function (a short function) */}
            <ControlButton label={t('carousel.previous')} onClick={() => go(current - 1)}>
              {/* className = CSS classes (Tailwind) for this element (class is a JS keyword) */}
              <ChevronLeft className="size-5" />
            </ControlButton>
            {/* { } in JSX = run JavaScript here and show its result
               t('key') = the text for this key in the current language (from i18n/en.js or kn.js)
               onClick = what happens on click/tap
               => = an arrow function (a short function) */}
            <ControlButton label={t('carousel.next')} onClick={() => go(current + 1)}>
              {/* className = CSS classes (Tailwind) for this element (class is a JS keyword) */}
              <ChevronRight className="size-5" />
            </ControlButton>
          </div>
        </div>
      )}
    </section>
  );
}

// function Name() = a React component (capital letter): returns what to show (JSX)
// { a, b } = destructuring: take properties a and b out of an object
// onClick = what happens on click/tap
// children = whatever is written between this component's opening and closing tags
function ControlButton({ label, onClick, children }) {
  // return = give this value back and stop the function here
  return (
    <button
      type="button"
      // onClick = what happens on click/tap
      // { } in JSX = run JavaScript here and show its result
      onClick={onClick}
      // aria-label = the name screen readers read for this element
      // { } in JSX = run JavaScript here and show its result
      aria-label={label}
      // { } in JSX = run JavaScript here and show its result
      title={label}
      // className = CSS classes (Tailwind) for this element (class is a JS keyword)
      className="flex size-10 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur hover:bg-white/30 focus-visible:outline-2 focus-visible:outline-white"
    >
      {/* { } in JSX = run JavaScript here and show its result
         children = whatever is written between this component's opening and closing tags */}
      {children}
    </button>
  );
}
