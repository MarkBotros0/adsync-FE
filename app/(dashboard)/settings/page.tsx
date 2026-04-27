'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/contexts/theme-context';

type ThemeOption = 'light' | 'dark';

const THEME_OPTIONS: { value: ThemeOption; label: string; icon: React.ElementType; description: string }[] = [
  { value: 'light', label: 'Light', icon: Sun,  description: 'Clean white interface' },
  { value: 'dark',  label: 'Dark',  icon: Moon, description: 'Deep purple night mode' },
];

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex flex-col h-full">
      <div className="bg-white dark:bg-dk-surface border-b border-slate-200 dark:border-dk-border px-6 py-4">
        <h1 className="text-base font-bold text-slate-900 dark:text-purple-100">Settings</h1>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-slate-50 dark:bg-dk-bg">

        {/* Appearance */}
        <section className="bg-white dark:bg-dk-surface rounded-xl border border-slate-200 dark:border-dk-border overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 dark:border-dk-border">
            <h2 className="text-sm font-semibold text-slate-800 dark:text-purple-100">Appearance</h2>
            <p className="text-xs text-slate-500 dark:text-purple-400 mt-0.5">Choose how Echofold looks for you.</p>
          </div>

          <div className="p-6">
            <p className="text-xs font-semibold text-slate-600 dark:text-purple-300 uppercase tracking-wide mb-3">Theme</p>
            <div className="grid grid-cols-2 gap-3 max-w-sm">
              {THEME_OPTIONS.map(({ value, label, icon: Icon, description }) => {
                const active = theme === value;
                return (
                  <button
                    key={value}
                    onClick={() => setTheme(value)}
                    data-testid={`theme-${value}`}
                    className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all
                      ${active
                        ? 'border-purple-500 dark:border-purple-400 bg-purple-50 dark:bg-purple-900/40'
                        : 'border-slate-200 dark:border-dk-border hover:border-slate-300 dark:hover:border-purple-700 bg-white dark:bg-dk-raised/50'
                      }`}
                  >
                    <div className={`h-10 w-10 rounded-full flex items-center justify-center
                      ${active
                        ? 'bg-purple-100 dark:bg-purple-800/60 text-purple-600 dark:text-purple-300'
                        : 'bg-slate-100 dark:bg-dk-raised text-slate-500 dark:text-purple-400'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className={`text-sm font-semibold text-center
                        ${active ? 'text-purple-700 dark:text-purple-300' : 'text-slate-700 dark:text-purple-400'}`}
                      >
                        {label}
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-purple-500 text-center leading-tight mt-0.5">
                        {description}
                      </p>
                    </div>
                    {active && (
                      <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wide">
                        Active
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* Other settings sections (coming soon) */}
        {[
          { title: 'Account',       description: 'Profile, email, and password settings' },
          { title: 'Notifications', description: 'Alert delivery and email preferences' },
          { title: 'Billing',       description: 'Subscription plan and payment methods' },
          { title: 'Security',      description: 'Two-factor authentication and sessions' },
        ].map(section => (
          <section
            key={section.title}
            className="bg-white dark:bg-dk-surface rounded-xl border border-slate-200 dark:border-dk-border overflow-hidden opacity-60"
          >
            <div className="px-6 py-4 border-b border-slate-100 dark:border-dk-border flex items-center gap-3">
              <div>
                <h2 className="text-sm font-semibold text-slate-800 dark:text-purple-100">{section.title}</h2>
                <p className="text-xs text-slate-500 dark:text-purple-400 mt-0.5">{section.description}</p>
              </div>
              <span className="ml-auto text-[10px] font-semibold bg-slate-100 dark:bg-dk-raised text-slate-400 dark:text-purple-500 px-2 py-0.5 rounded uppercase tracking-wide">
                Soon
              </span>
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
