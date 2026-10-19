import { useTranslation } from 'react-i18next';
import { Languages } from 'lucide-react';
import { LANGUAGES, setLanguage } from '@/i18n';

// Shows the OTHER language, written in that language ("ಕನ್ನಡ" while reading English,
// "English" while reading Kannada): someone who can't read the current language can still
// recognise their own. A common rule for language switchers.
export function LanguageSwitch({ className = '' }) {
  const { t, i18n } = useTranslation();
  const other = i18n.language === 'kn' ? 'en' : 'kn';
  const name = LANGUAGES[other].name;

  return (
    <button
      type="button"
      onClick={() => setLanguage(other)}
      lang={other}
      aria-label={t('language.switchTo', { language: name })}
      title={t('language.switchTo', { language: name })}
      className={`flex items-center gap-1.5 rounded-lg px-2 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 ${className}`}
    >
      <Languages className="size-5" aria-hidden />
      <span className="hidden sm:inline">{name}</span>
    </button>
  );
}
