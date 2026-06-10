import type { HTMLAttributes, ReactNode } from 'react';

// Карточка-поверхность дизайн-системы (docs/14, §5).
export function Card({ className, children, ...rest }: HTMLAttributes<HTMLDivElement>): ReactNode {
  return (
    <div
      className={`rounded-lg border border-[var(--border)] bg-surface p-5 shadow-sm ${className ?? ''}`}
      {...rest}
    >
      {children}
    </div>
  );
}
