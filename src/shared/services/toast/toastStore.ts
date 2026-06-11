import { create } from 'zustand';

// SERVICE: очередь тостов (сайд-эффект — таймеры автоскрытия). Источник правды по тостам.
// UI рисует <Toaster> из shared/ui; триггерить можно императивно через `toast.*` —
// в т.ч. вне React (глобальные обработчики ошибок React Query).
export type ToastTone = 'success' | 'error' | 'info';
export type ToastItem = { id: string; tone: ToastTone; message: string };

const AUTO_DISMISS_MS = 4500;

type ToastState = {
  toasts: ToastItem[];
  push: (tone: ToastTone, message: string) => void;
  dismiss: (id: string) => void;
};

export const useToasts = create<ToastState>((set, get) => ({
  toasts: [],
  push: (tone, message) => {
    const id = crypto.randomUUID();
    set((s) => ({ toasts: [...s.toasts, { id, tone, message }] }));
    setTimeout(() => get().dismiss(id), AUTO_DISMISS_MS);
  },
  dismiss: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));

// Императивный API (можно вызывать вне компонентов).
export const toast = {
  success: (message: string) => useToasts.getState().push('success', message),
  error: (message: string) => useToasts.getState().push('error', message),
  info: (message: string) => useToasts.getState().push('info', message),
};
