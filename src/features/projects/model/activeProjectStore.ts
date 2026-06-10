import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Активный проект. Все данные/настройки привязаны к нему (pid в ключах кэша, docs/07).
// Переключатель проектов — Шаг 2 (сейчас один проект), но стор уже централизован.
type ActiveProjectState = {
  activeProjectId: string | null;
  setActiveProject: (id: string | null) => void;
};

export const useActiveProject = create<ActiveProjectState>()(
  persist(
    (set) => ({
      activeProjectId: null,
      setActiveProject: (id) => set({ activeProjectId: id }),
    }),
    { name: 'stringly-active-project' },
  ),
);
