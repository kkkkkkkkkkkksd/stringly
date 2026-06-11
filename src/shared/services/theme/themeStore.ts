import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// SERVICE: тема оформления (сайд-эффект — DOM + storage). Источник правды по теме приложения.
// Токены light/dark уже заданы в shared/ui/tokens.css под [data-theme]. Здесь — выбор режима.
export type ThemeMode = 'light' | 'dark' | 'system';

const systemDark = (): boolean =>
  typeof window !== 'undefined' && !!window.matchMedia
    ? window.matchMedia('(prefers-color-scheme: dark)').matches
    : false;

export const resolveTheme = (mode: ThemeMode): 'light' | 'dark' =>
  mode === 'system' ? (systemDark() ? 'dark' : 'light') : mode;

const applyTheme = (mode: ThemeMode): void => {
  if (typeof document !== 'undefined') {
    document.documentElement.dataset.theme = resolveTheme(mode);
  }
};

type ThemeState = { mode: ThemeMode; setMode: (mode: ThemeMode) => void };

export const useTheme = create<ThemeState>()(
  persist(
    (set) => ({
      mode: 'system',
      setMode: (mode) => {
        applyTheme(mode);
        set({ mode });
      },
    }),
    {
      name: 'stringly-theme',
      onRehydrateStorage: () => (state) => {
        if (state) applyTheme(state.mode);
      },
    },
  ),
);

// Применить тему на старте и следить за сменой системной темы (для режима 'system').
export function initTheme(): void {
  applyTheme(useTheme.getState().mode);
  if (typeof window !== 'undefined' && window.matchMedia) {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
      if (useTheme.getState().mode === 'system') applyTheme('system');
    });
  }
}
