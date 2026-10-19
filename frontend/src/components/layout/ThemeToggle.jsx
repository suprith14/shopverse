// import = bring in code from another file or package
// useTranslation = gives t() for text in the reader's language (English/Kannada)
import { useTranslation } from 'react-i18next';
// import = bring in code from another file or package
import { Monitor, Moon, Sun } from 'lucide-react';
// import = bring in code from another file or package
import { setThemePreference, useTheme } from '@/lib/theme';

// One button that cycles System -> Light -> Dark. The icon shows the current choice,
// and the label says what a click does next (for screen readers and the tooltip).
// const = a name for a value that is never reassigned
const options = {
  system: { icon: Monitor, next: 'light' },
  light: { icon: Sun, next: 'dark' },
  dark: { icon: Moon, next: 'system' },
};

// export = other files can import this
// function Name() = a React component (capital letter): returns what to show (JSX)
// { a, b } = destructuring: take properties a and b out of an object
// x = value (in parameters) = the default used when x is not given
export function ThemeToggle({ className = '' }) {
  // const = a name for a value that is never reassigned
  // { a, b } = destructuring: take properties a and b out of an object
  // t('key') = the text for this key in the current language (from i18n/en.js or kn.js)
  // useTranslation = gives t() for text in the reader's language (English/Kannada)
  const { t } = useTranslation();
  // const = a name for a value that is never reassigned
  // => = an arrow function (a short function)
  const preference = useTheme((s) => s.preference);
  // const = a name for a value that is never reassigned
  // { a, b } = destructuring: take properties a and b out of an object
  // obj[key] = read the property whose name is stored in key
  const { icon: Icon, next } = options[preference];
  // const = a name for a value that is never reassigned
  // t('key') = the text for this key in the current language (from i18n/en.js or kn.js)
  // `text ${x}` = a template string: text with values inserted
  const action = t('theme.action', { current: t(`theme.${preference}`), next: t(`theme.${next}`) });

  // return = give this value back and stop the function here
  return (
    <button
      type="button"
      // onClick = what happens on click/tap
      // { } in JSX = run JavaScript here and show its result
      // => = an arrow function (a short function)
      onClick={() => setThemePreference(next)}
      // aria-label = the name screen readers read for this element
      // { } in JSX = run JavaScript here and show its result
      aria-label={action}
      // { } in JSX = run JavaScript here and show its result
      title={action}
      // className = CSS classes (Tailwind) for this element (class is a JS keyword)
      // { } in JSX = run JavaScript here and show its result
      // `text ${x}` = a template string: text with values inserted
      className={`rounded-lg p-2 text-slate-600 hover:bg-slate-100 ${className}`}
    >
      {/* className = CSS classes (Tailwind) for this element (class is a JS keyword) */}
      <Icon className="size-5" />
    </button>
  );
}
