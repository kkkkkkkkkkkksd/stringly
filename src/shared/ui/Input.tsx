import { forwardRef, useId, type InputHTMLAttributes, type ReactNode } from 'react';

// Поле ввода дизайн-системы (docs/14, §5). Совместимо с React Hook Form через forwardRef.
// size: md (36px, рабочие формы) | lg (44px, «входные» экраны — крупнее).
type InputSize = 'md' | 'lg';
type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
  inputSize?: InputSize;
};

const sizeClasses: Record<InputSize, string> = {
  md: 'h-9 px-3 text-sm',
  lg: 'h-11 px-3.5 text-[15px]',
};
const labelClasses: Record<InputSize, string> = {
  md: 'text-xs',
  lg: 'text-sm',
};

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, id, className, inputSize = 'md', ...rest },
  ref,
): ReactNode {
  const autoId = useId();
  const inputId = id ?? autoId;
  return (
    <div>
      {label && (
        <label htmlFor={inputId} className={`mb-1.5 block text-muted ${labelClasses[inputSize]}`}>
          {label}
        </label>
      )}
      <input
        id={inputId}
        ref={ref}
        aria-invalid={!!error}
        className={[
          'w-full rounded-md border bg-surface text-ink',
          sizeClasses[inputSize],
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
