import { useTranslation } from 'react-i18next';
import { Monitor, Moon, Sun } from 'lucide-react';
import { setThemePreference, useTheme } from '@/lib/theme';

// One button that cycles System -> Light -> Dark. The icon shows the current choice,
// and the label says what a click does next (for screen readers and the tooltip).
const options = {
  system: { icon: Monitor, next: 'light' },
  light: { icon: Sun, next: 'dark' },
  dark: { icon: Moon, next: 'system' },
};

export function ThemeToggle({ className = '' }) {
  const { t } = useTranslation();
  const preference = useTheme((s) => s.preference);
  const { icon: Icon, next } = options[preference];
  const action = t('theme.action', { current: t(`theme.${preference}`), next: t(`theme.${next}`) });

  return (
    <button
      type="button"
      onClick={() => setThemePreference(next)}
      aria-label={action}
      title={action}
      className={`rounded-lg p-2 text-slate-600 hover:bg-slate-100 ${className}`}
    >
      <Icon className="size-5" />
    </button>
  );
}
