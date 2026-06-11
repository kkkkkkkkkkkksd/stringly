import type { HTMLAttributes, ReactNode } from 'react';

// Строка-карточка списка (дизайн-вариант B, см. docs/14). Тонкая рамка + поверхность,
// контент выкладывается флексом. Переиспользуется в настройках (языки, участники) и
// везде, где нужен список «строк-карточек». Не плодим разовые стили по экранам.
export function Row({ className, children, ...rest }: HTMLAttributes<HTMLDivElement>): ReactNode {
  return (
    <div
      className={`flex items-center gap-3 rounded-lg border border-[var(--border)] bg-surface px-3.5 py-3 ${className ?? ''}`}
      {...rest}
    >
      {children}
    </div>
  );
}
