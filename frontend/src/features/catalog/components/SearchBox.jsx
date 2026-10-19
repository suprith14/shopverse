// import = bring in code from another file or package
// useTranslation = gives t() for text in the reader's language (English/Kannada)
import { useTranslation } from 'react-i18next';
// import = bring in code from another file or package
// useEffect = run code AFTER the screen is drawn (timers, events, browser APIs); re-runs when its [deps] change
// useId = a unique id per component instance (for label/aria links)
// useRef = a box (.current) that keeps a value or a DOM element without causing a redraw
// useState = a value the component remembers; calling its setter redraws the component
import { useEffect, useId, useRef, useState } from 'react';
// import = bring in code from another file or package
// useLocation = the current URL (pathname, search) and any state passed to it
// useNavigate = gives navigate(url) to change page from code
// useSearchParams = read/write the ?query=part of the URL
import { useLocation, useNavigate, useSearchParams } from 'react-router';
// import = bring in code from another file or package
import { Loader2, Search, Tag, LayoutGrid } from 'lucide-react';
// import = bring in code from another file or package
import { formatPrice } from '@/lib/format';
// import = bring in code from another file or package
import { useDebounce } from '@/lib/use-debounce';
// import = bring in code from another file or package
import { useSuggestions } from '../catalog.api';

// Header search with suggestions as you type.
//  - Debounced: waits 250 ms after the last keystroke before asking the server.
//  - Keyboard: ↑/↓ move, Enter opens the highlighted row (or searches), Esc closes.
// className positions the box (the header uses it twice: inline on wide screens, own row on phones).
// export = other files can import this
// function Name() = a React component (capital letter): returns what to show (JSX)
// { a, b } = destructuring: take properties a and b out of an object
// x = value (in parameters) = the default used when x is not given
export function SearchBox({ className = '' }) {
  // const = a name for a value that is never reassigned
  // { a, b } = destructuring: take properties a and b out of an object
  // t('key') = the text for this key in the current language (from i18n/en.js or kn.js)
  // useTranslation = gives t() for text in the reader's language (English/Kannada)
  const { t } = useTranslation();
  // const = a name for a value that is never reassigned
  // useNavigate = gives navigate(url) to change page from code
  const navigate = useNavigate();
  // const = a name for a value that is never reassigned
  // useLocation = the current URL (pathname, search) and any state passed to it
  const location = useLocation();
  // const = a name for a value that is never reassigned
  // [a, b] = destructuring: take the first and second items of an array
  // useSearchParams = read/write the ?query=part of the URL
  const [params] = useSearchParams();
  // on /shop?q=… the box shows the current search; elsewhere it starts empty
  // const = a name for a value that is never reassigned
  // a ? b : c = ternary: if a then b else c
  // === = strictly equal (same value AND same type)
  // a ?? b = a, unless a is null/undefined, then b
  const urlQuery = location.pathname === '/shop' ? (params.get('q') ?? '') : '';

  // const = a name for a value that is never reassigned
  // [a, b] = destructuring: take the first and second items of an array
  // useState = a value the component remembers; calling its setter redraws the component
  const [text, setText] = useState(urlQuery);
  // const = a name for a value that is never reassigned
  // [a, b] = destructuring: take the first and second items of an array
  // useState = a value the component remembers; calling its setter redraws the component
  const [open, setOpen] = useState(false);
  // const = a name for a value that is never reassigned
  // [a, b] = destructuring: take the first and second items of an array
  // useState = a value the component remembers; calling its setter redraws the component
  const [active, setActive] = useState(-1); // highlighted row, -1 = none
  // const = a name for a value that is never reassigned
  // useRef = a box (.current) that keeps a value or a DOM element without causing a redraw
  const boxRef = useRef(null);
  // const = a name for a value that is never reassigned
  // useId = a unique id per component instance (for label/aria links)
  const listId = useId(); // unique per instance: the header renders two search boxes (desktop + phone)

  // Keep the box in sync when the search changes from elsewhere (back button, clear filters).
  // useEffect = run code AFTER the screen is drawn (timers, events, browser APIs); re-runs when its [deps] change
  // => = an arrow function (a short function)
  useEffect(() => setText(urlQuery), [urlQuery]);

  // const = a name for a value that is never reassigned
  const debounced = useDebounce(text, 250);
  // const = a name for a value that is never reassigned
  // { a, b } = destructuring: take properties a and b out of an object
  // isFetching = a request is running (even if old data is shown)
  // a ? b : c = ternary: if a then b else c
  const { data, isFetching } = useSuggestions(open ? debounced : '');

  // Close when clicking anywhere outside the search box.
  // useEffect = run code AFTER the screen is drawn (timers, events, browser APIs); re-runs when its [deps] change
  // => = an arrow function (a short function)
  useEffect(() => {
    // const = a name for a value that is never reassigned
    // onClick = what happens on click/tap
    // => = an arrow function (a short function)
    const onClick = (e) => {
      // if (...) = run the next part only when the condition is true
      // ! = NOT: flips true/false
      // ?.() = call only if the function exists
      // ?. = optional chaining: stop (undefined) instead of crashing if the left side is null/undefined
      if (!boxRef.current?.contains(e.target)) setOpen(false);
    };
    // document = the current web page (its HTML elements)
    // addEventListener = run a function when an event happens
    // onClick = what happens on click/tap
    document.addEventListener('mousedown', onClick);
    // return = give this value back and stop the function here
    // => = an arrow function (a short function)
    // document = the current web page (its HTML elements)
    // removeEventListener = stop listening (cleanup)
    // onClick = what happens on click/tap
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  // const = a name for a value that is never reassigned
  // .trim = remove spaces at both ends
  const trimmed = text.trim();
  // The dropdown rows, in order: "Search for …", then matching categories, brands and products.
  // const = a name for a value that is never reassigned
  const rows = [];
  // if (...) = run the next part only when the condition is true
  if (trimmed.length >= 2) {
    rows.push({
      key: 'search',
      kind: 'search',
      // `text ${x}` = a template string: text with values inserted
      // encodeURIComponent = make text safe to put in a URL
      to: `/shop?q=${encodeURIComponent(trimmed)}`,
      // t('key') = the text for this key in the current language (from i18n/en.js or kn.js)
      label: t('search.searchFor', { query: trimmed }),
    });
    // if (...) = run the next part only when the condition is true
    if (data) {
      // const = a name for a value that is never reassigned
      for (const c of data.categories)
        rows.push({
          // `text ${x}` = a template string: text with values inserted
          key: `c-${c.slug}`,
          kind: 'category',
          // `text ${x}` = a template string: text with values inserted
          to: `/shop?category=${c.slug}`,
          // t('key') = the text for this key in the current language (from i18n/en.js or kn.js)
          // `text ${x}` = a template string: text with values inserted
          label: t(`category.${c.slug}`, { defaultValue: c.name }),
          // t('key') = the text for this key in the current language (from i18n/en.js or kn.js)
          sub: t('search.category'),
        });
      // const = a name for a value that is never reassigned
      for (const b of data.brands)
        // `text ${x}` = a template string: text with values inserted
        // encodeURIComponent = make text safe to put in a URL
        // t('key') = the text for this key in the current language (from i18n/en.js or kn.js)
        rows.push({ key: `b-${b}`, kind: 'brand', to: `/shop?brand=${encodeURIComponent(b)}`, label: b, sub: t('search.brand') });
      // const = a name for a value that is never reassigned
      for (const p of data.products)
        rows.push({
          key: p.id,
          kind: 'product',
          // `text ${x}` = a template string: text with values inserted
          to: `/products/${p.slug}`,
          label: p.name,
          // `text ${x}` = a template string: text with values inserted
          // a ?? b = a, unless a is null/undefined, then b
          sub: `${p.brand ?? ''} · ${formatPrice(p.basePrice)}`,
          image: p.image,
        });
    }
  }

  // const = a name for a value that is never reassigned
  // => = an arrow function (a short function)
  const go = (to) => {
    setOpen(false);
    setActive(-1);
    navigate(to);
  };

  // const = a name for a value that is never reassigned
  // onSubmit = runs when the form is sent (Enter or submit button)
  // => = an arrow function (a short function)
  const onSubmit = (e) => {
    // preventDefault = stop the browser's default action (form submit reload, link follow)
    e.preventDefault();
    // if (...) = run the next part only when the condition is true
    // a && b = AND; in JSX: show b only when a is true
    // obj[key] = read the property whose name is stored in key
    // return = give this value back and stop the function here
    if (active >= 0 && rows[active]) return go(rows[active].to);
    // a ? b : c = ternary: if a then b else c
    // `text ${x}` = a template string: text with values inserted
    // encodeURIComponent = make text safe to put in a URL
    go(trimmed ? `/shop?q=${encodeURIComponent(trimmed)}` : '/shop');
  };

  // Arrow keys move through the rows, Enter opens the highlighted one, Escape closes the list
  // const = a name for a value that is never reassigned
  // onKeyDown = runs when a key is pressed
  // => = an arrow function (a short function)
  const onKeyDown = (e) => {
    // if (...) = run the next part only when the condition is true
    // === = strictly equal (same value AND same type)
    if (e.key === 'ArrowDown') {
      // preventDefault = stop the browser's default action (form submit reload, link follow)
      e.preventDefault();
      setOpen(true);
      // => = an arrow function (a short function)
      // Math = number helpers (min, max, round, floor...)
      setActive((i) => Math.min(i + 1, rows.length - 1));
    // if (...) = run the next part only when the condition is true
    // === = strictly equal (same value AND same type)
    } else if (e.key === 'ArrowUp') {
      // preventDefault = stop the browser's default action (form submit reload, link follow)
      e.preventDefault();
      // => = an arrow function (a short function)
      // Math = number helpers (min, max, round, floor...)
      setActive((i) => Math.max(i - 1, -1));
    // if (...) = run the next part only when the condition is true
    // === = strictly equal (same value AND same type)
    } else if (e.key === 'Escape') {
      setOpen(false);
      setActive(-1);
    }
  };

  // const = a name for a value that is never reassigned
  // a && b = AND; in JSX: show b only when a is true
  const showDropdown = open && rows.length > 0;

  // return = give this value back and stop the function here
  return (
    // ref = after drawing, put this element into a useRef box (.current)
    // { } in JSX = run JavaScript here and show its result
    // className = CSS classes (Tailwind) for this element (class is a JS keyword)
    // `text ${x}` = a template string: text with values inserted
    <div ref={boxRef} className={`relative ${className}`}>
      {/* <form> = groups inputs; Enter or a submit button sends it (onSubmit)
         onSubmit = runs when the form is sent (Enter or submit button)
         { } in JSX = run JavaScript here and show its result
         role = tells screen readers what this element is (status, tab, group...) */}
      <form onSubmit={onSubmit} role="search">
        {/* className = CSS classes (Tailwind) for this element (class is a JS keyword) */}
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
        <input
          // { } in JSX = run JavaScript here and show its result
          value={text}
          // onChange = runs on every change of an input
          // { } in JSX = run JavaScript here and show its result
          // => = an arrow function (a short function)
          onChange={(e) => {
            setText(e.target.value);
            setOpen(true);
            setActive(-1);
          }}
          // onFocus = runs when the element gets keyboard focus
          // { } in JSX = run JavaScript here and show its result
          // => = an arrow function (a short function)
          onFocus={() => setOpen(true)}
          // onKeyDown = runs when a key is pressed
          // { } in JSX = run JavaScript here and show its result
          onKeyDown={onKeyDown}
          // placeholder = grey hint text inside an empty input
          // { } in JSX = run JavaScript here and show its result
          // t('key') = the text for this key in the current language (from i18n/en.js or kn.js)
          placeholder={t('search.placeholder')}
          // aria-label = the name screen readers read for this element
          // { } in JSX = run JavaScript here and show its result
          // t('key') = the text for this key in the current language (from i18n/en.js or kn.js)
          aria-label={t('search.label')}
          // ARIA combobox pattern: screen readers announce the list and the highlighted row
          // role = tells screen readers what this element is (status, tab, group...)
          role="combobox"
          // aria-expanded = tells screen readers if the controlled panel is open
          // { } in JSX = run JavaScript here and show its result
          aria-expanded={showDropdown}
          // aria-controls = the id of the element this button opens/closes
          // { } in JSX = run JavaScript here and show its result
          aria-controls={listId}
          // aria-activedescendant = which option in the list is highlighted
          // { } in JSX = run JavaScript here and show its result
          // a ? b : c = ternary: if a then b else c
          // `text ${x}` = a template string: text with values inserted
          aria-activedescendant={active >= 0 ? `${listId}-${active}` : undefined}
          // autoComplete = tells the browser what to auto-fill (email, password, address...)
          autoComplete="off"
          // className = CSS classes (Tailwind) for this element (class is a JS keyword)
          className="w-full rounded-full border border-slate-300 bg-slate-50 py-2 pl-9 pr-9 text-sm outline-none focus:border-brand-500 focus:bg-surface"
        />

        {/* { } in JSX = run JavaScript here and show its result
           isFetching = a request is running (even if old data is shown)
           a && b = AND; in JSX: show b only when a is true */}
        {isFetching && (
          // className = CSS classes (Tailwind) for this element (class is a JS keyword)
          <Loader2 className="absolute right-3 top-1/2 size-4 -translate-y-1/2 animate-spin text-slate-400" />
        )}
      </form>

      {/* { } in JSX = run JavaScript here and show its result
         a && b = AND; in JSX: show b only when a is true */}
      {showDropdown && (
        <ul
          // { } in JSX = run JavaScript here and show its result
          id={listId}
          // role = tells screen readers what this element is (status, tab, group...)
          role="listbox"
          // className = CSS classes (Tailwind) for this element (class is a JS keyword)
          className="absolute inset-x-0 top-full z-30 mt-2 overflow-hidden rounded-xl border border-slate-200 bg-surface py-1 shadow-lg"
        >
          {/* { } in JSX = run JavaScript here and show its result
             .map = make a new array by transforming each item (in JSX: one element per item)
             => = an arrow function (a short function) */}
          {rows.map((row, i) => (
            <li
              // key = a stable id for list items so React can track them between redraws
              // { } in JSX = run JavaScript here and show its result
              key={row.key}
              // { } in JSX = run JavaScript here and show its result
              // `text ${x}` = a template string: text with values inserted
              id={`${listId}-${i}`}
              // role = tells screen readers what this element is (status, tab, group...)
              role="option"
              // aria-selected = which tab/option is selected
              // { } in JSX = run JavaScript here and show its result
              // === = strictly equal (same value AND same type)
              aria-selected={i === active}
              // onMouseEnter = the pointer moved over the element
              // { } in JSX = run JavaScript here and show its result
              // => = an arrow function (a short function)
              onMouseEnter={() => setActive(i)}
              // mousedown (not click) fires before the input loses focus, so the dropdown is still there
              // mousedown (not click) fires before the input loses focus, so the list is still there
              // onMouseDown = mouse button pressed (fires before focus moves)
              // { } in JSX = run JavaScript here and show its result
              // => = an arrow function (a short function)
              onMouseDown={(e) => {
                // preventDefault = stop the browser's default action (form submit reload, link follow)
                e.preventDefault();
                go(row.to);
              }}
              // className = CSS classes (Tailwind) for this element (class is a JS keyword)
              // { } in JSX = run JavaScript here and show its result
              // `text ${x}` = a template string: text with values inserted
              // a ? b : c = ternary: if a then b else c
              // === = strictly equal (same value AND same type)
              className={`flex cursor-pointer items-center gap-3 px-3 py-2 text-sm ${i === active ? 'bg-slate-100' : ''}`}
            >
              {/* { } in JSX = run JavaScript here and show its result */}
              <RowIcon row={row} />
              {/* className = CSS classes (Tailwind) for this element (class is a JS keyword) */}
              <div className="min-w-0 flex-1">
                {/* className = CSS classes (Tailwind) for this element (class is a JS keyword)
                   { } in JSX = run JavaScript here and show its result
                   `text ${x}` = a template string: text with values inserted
                   a ? b : c = ternary: if a then b else c
                   === = strictly equal (same value AND same type) */}
                <p className={`truncate ${row.kind === 'search' ? 'font-medium' : ''}`}>{row.label}</p>
                {/* { } in JSX = run JavaScript here and show its result
                   a && b = AND; in JSX: show b only when a is true
                   className = CSS classes (Tailwind) for this element (class is a JS keyword) */}
                {row.sub && <p className="truncate text-xs text-slate-500">{row.sub}</p>}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// function Name() = a React component (capital letter): returns what to show (JSX)
// { a, b } = destructuring: take properties a and b out of an object
function RowIcon({ row }) {
  // if (...) = run the next part only when the condition is true
  // === = strictly equal (same value AND same type)
  if (row.kind === 'product') {
    // return = give this value back and stop the function here
    return (
      // className = CSS classes (Tailwind) for this element (class is a JS keyword)
      <div className="size-9 shrink-0 overflow-hidden rounded bg-slate-100">
        {/* { } in JSX = run JavaScript here and show its result
           a && b = AND; in JSX: show b only when a is true
           alt = text describing the image for screen readers (empty = decorative)
           className = CSS classes (Tailwind) for this element (class is a JS keyword) */}
        {row.image && <img src={row.image} alt="" className="size-full object-cover" />}
      </div>
    );
  }
  // const = a name for a value that is never reassigned
  // a ? b : c = ternary: if a then b else c
  // === = strictly equal (same value AND same type)
  const Icon = row.kind === 'search' ? Search : row.kind === 'brand' ? Tag : LayoutGrid;
  // return = give this value back and stop the function here
  return (
    // className = CSS classes (Tailwind) for this element (class is a JS keyword)
    <div className="flex size-9 shrink-0 items-center justify-center rounded bg-slate-100 text-slate-500">
      {/* className = CSS classes (Tailwind) for this element (class is a JS keyword) */}
      <Icon className="size-4" />
    </div>
  );
}
