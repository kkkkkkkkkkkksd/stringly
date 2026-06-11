import { forwardRef, useId, type ReactNode, type SelectHTMLAttributes } from 'react';

// Селект дизайн-системы (docs/14, §5). Высота 36px, focus-ring. Совместим с RHF (forwardRef).
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
      <select
        id={selectId}
        ref={ref}
        className={[
          'h-9 w-full rounded-md border border-[var(--border)] bg-surface px-2.5 text-sm text-ink',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--ring)]',
          className ?? '',
        ].join(' ')}
        {...rest}
      >
        {children}
      </select>
    </div>
  );
});
