import { Monitor, Moon, Sun } from 'lucide-react';
import { setThemePreference, useTheme } from '@/lib/theme';

// One button that cycles System -> Light -> Dark. The icon shows the current choice,
// and the label says what a click does next (for screen readers and the tooltip).
const options = {
  system: { icon: Monitor, label: 'System theme', next: 'light' },
  light: { icon: Sun, label: 'Light theme', next: 'dark' },
  dark: { icon: Moon, label: 'Dark theme', next: 'system' },
};

export function ThemeToggle({ className = '' }) {
  const preference = useTheme((s) => s.preference);
  const { icon: Icon, label, next } = options[preference];
  const action = `${label}. Switch to ${options[next].label.toLowerCase()}`;

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
