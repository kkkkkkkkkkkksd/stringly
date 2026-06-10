import { forwardRef, useId, type InputHTMLAttributes, type ReactNode } from 'react';

// Поле ввода дизайн-системы (docs/14, §5). Совместимо с React Hook Form через forwardRef.
type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, id, className, ...rest },
  ref,
): ReactNode {
  const autoId = useId();
  const inputId = id ?? autoId;
  return (
    <div>
      {label && (
        <label htmlFor={inputId} className="mb-1.5 block text-xs text-muted">
          {label}
        </label>
      )}
      <input
        id={inputId}
        ref={ref}
        aria-invalid={!!error}
        className={[
          'h-9 w-full rounded-md border bg-surface px-3 text-sm text-ink',
          'placeholder:text-faint focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--ring)]',
          error ? 'border-[color:var(--danger)]' : 'border-[var(--border)]',
          className ?? '',
        ].join(' ')}
        {...rest}
      />
      {error && <p className="mt-1 text-xs text-[color:var(--danger-fg)]">{error}</p>}
    </div>
  );
});
