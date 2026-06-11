import type { ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { useToasts } from '@/shared/services/toast';
import { Toast } from './Toast';

// Контейнер тостов: монтируется один раз на уровне приложения. Стек снизу справа,
// поверх всего; сам контейнер прозрачен для кликов, кликабельны только тосты.
export function Toaster(): ReactNode {
  const toasts = useToasts((s) => s.toasts);
  const dismiss = useToasts((s) => s.dismiss);
  if (typeof document === 'undefined') return null;

  return createPortal(
    <div className="pointer-events-none fixed bottom-4 right-4 z-[100] flex w-full max-w-sm flex-col gap-2">
      {toasts.map((item) => (
        <Toast key={item.id} item={item} onClose={() => dismiss(item.id)} />
      ))}
    </div>,
    document.body,
  );
}
