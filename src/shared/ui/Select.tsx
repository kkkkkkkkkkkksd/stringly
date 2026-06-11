import { forwardRef, useId, type ReactNode, type SelectHTMLAttributes } from 'react';
import { ChevronDownIcon } from '@/shared/resources/assets';

// Селект дизайн-системы (docs/14, §5). Высота 36px, focus-ring. Совместим с RHF (forwardRef).
// Нативная стрелка скрыта (appearance-none) и заменена своим шевроном с отступом от края —
// одинаково во всех браузерах; pr-9 резервирует место, чтобы текст не заходил под иконку.
type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & { label?: string };

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { label, id, className, children, ...rest },
  ref,
): ReactNode {
  const autoId = useId();
  const selectId = id ?? autoId;
  return (
    <div>
      {label && (
        <label htmlFor={selectId} className="mb-1.5 block text-xs text-muted">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          id={selectId}
          ref={ref}
          className={[
            'h-9 w-full appearance-none rounded-md border border-[var(--border)] bg-surface pl-2.5 pr-9 text-sm text-ink',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--ring)]',
            className ?? '',
          ].join(' ')}
          {...rest}
        >
          {children}
        </select>
        <ChevronDownIcon
          size={16}
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted"
        />
      </div>
    </div>
  );
});
