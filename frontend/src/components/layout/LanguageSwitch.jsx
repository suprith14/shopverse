// import = bring in code from another file or package
// useTranslation = gives t() for text in the reader's language (English/Kannada)
import { useTranslation } from 'react-i18next';
// import = bring in code from another file or package
import { Languages } from 'lucide-react';
// import = bring in code from another file or package
import { LANGUAGES, setLanguage } from '@/i18n';

// Shows the OTHER language, written in that language ("ಕನ್ನಡ" while reading English,
// "English" while reading Kannada): someone who can't read the current language can still
// recognise their own. A common rule for language switchers.
// export = other files can import this
// function Name() = a React component (capital letter): returns what to show (JSX)
// { a, b } = destructuring: take properties a and b out of an object
// x = value (in parameters) = the default used when x is not given
export function LanguageSwitch({ className = '' }) {
  // const = a name for a value that is never reassigned
  // { a, b } = destructuring: take properties a and b out of an object
  // t('key') = the text for this key in the current language (from i18n/en.js or kn.js)
  // i18n = the translation library instance (current language, changeLanguage)
  // useTranslation = gives t() for text in the reader's language (English/Kannada)
  const { t, i18n } = useTranslation();
  // const = a name for a value that is never reassigned
  // a ? b : c = ternary: if a then b else c
  // i18n = the translation library instance (current language, changeLanguage)
  // === = strictly equal (same value AND same type)
  const other = i18n.language === 'kn' ? 'en' : 'kn';
  // const = a name for a value that is never reassigned
  // obj[key] = read the property whose name is stored in key
  const name = LANGUAGES[other].name;

  // return = give this value back and stop the function here
  return (
    <button
      type="button"
      // onClick = what happens on click/tap
      // { } in JSX = run JavaScript here and show its result
      // => = an arrow function (a short function)
      onClick={() => setLanguage(other)}
      // lang = the language of this text (pronunciation, fonts)
      // { } in JSX = run JavaScript here and show its result
      lang={other}
      // aria-label = the name screen readers read for this element
      // { } in JSX = run JavaScript here and show its result
      // t('key') = the text for this key in the current language (from i18n/en.js or kn.js)
      aria-label={t('language.switchTo', { language: name })}
      // { } in JSX = run JavaScript here and show its result
      // t('key') = the text for this key in the current language (from i18n/en.js or kn.js)
      title={t('language.switchTo', { language: name })}
      // className = CSS classes (Tailwind) for this element (class is a JS keyword)
      // { } in JSX = run JavaScript here and show its result
      // `text ${x}` = a template string: text with values inserted
      className={`flex items-center gap-1.5 rounded-lg px-2 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 ${className}`}
    >
      {/* className = CSS classes (Tailwind) for this element (class is a JS keyword)
         aria-hidden = screen readers skip this (decoration) */}
      <Languages className="size-5" aria-hidden />
      {/* className = CSS classes (Tailwind) for this element (class is a JS keyword)
         { } in JSX = run JavaScript here and show its result */}
      <span className="hidden sm:inline">{name}</span>
    </button>
  );
}
