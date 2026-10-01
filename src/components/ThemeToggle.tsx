import React from 'react';
import { Sun, Moon, Laptop } from 'lucide-react';
import { useTheme, ThemeMode } from '../context/ThemeContext';

export const ThemeToggleCompact: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      className={`relative flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors ${className}`}
      aria-label="Toggle theme"
    >
      {isDark ? (
        <Sun className="h-4 w-4 text-amber-400" />
      ) : (
        <Moon className="h-4 w-4 text-slate-600" />
      )}
    </button>
  );
};

export const ThemeSelectorCard: React.FC<{ title?: string; description?: string }> = ({
  title = 'Appearance & Theme Preference',
  description = 'Choose between light, dark, or system preference mode for your ERMS interface.',
}) => {
  const { theme, setTheme } = useTheme();

  const options: Array<{ id: ThemeMode; label: string; desc: string; icon: typeof Sun }> = [
    {
      id: 'light',
      label: 'Light Mode',
      desc: 'Clean, high-contrast light theme',
      icon: Sun,
    },
    {
      id: 'dark',
      label: 'Dark Mode',
      desc: 'Sleek, eye-friendly dark palette',
      icon: Moon,
    },
    {
      id: 'system',
      label: 'System Match',
      desc: 'Automatically matches your OS settings',
      icon: Laptop,
    },
  ];

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs dark:border-slate-800 dark:bg-slate-900 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Sun className="h-4 w-4 text-amber-500 dark:hidden" />
            <Moon className="h-4 w-4 text-indigo-400 hidden dark:block" />
            {title}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{description}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {options.map(opt => {
          const active = theme === opt.id;
          const Icon = opt.icon;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => setTheme(opt.id)}
              className={`flex flex-col items-start p-4 rounded-xl border text-left transition-all ${
                active
                  ? 'border-indigo-600 bg-indigo-50/70 text-indigo-900 ring-2 ring-indigo-600/20 dark:border-indigo-500 dark:bg-indigo-950/40 dark:text-indigo-200'
                  : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-300 dark:hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center justify-between w-full mb-2">
                <div
                  className={`p-2 rounded-lg ${
                    active
                      ? 'bg-indigo-600 text-white dark:bg-indigo-500'
                      : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                </div>
                {active && (
                  <span className="flex h-2 w-2 rounded-full bg-indigo-600 dark:bg-indigo-400" />
                )}
              </div>
              <span className="text-xs font-bold">{opt.label}</span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                {opt.desc}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
