import { forwardRef, useId, useState, type InputHTMLAttributes, type ReactNode } from 'react';
import { EyeIcon, EyeOffIcon } from '@/shared/resources/assets';
import { texts } from '@/shared/resources/i18n';

// Поле ввода дизайн-системы (docs/14, §5). Совместимо с React Hook Form через forwardRef.
// size: md (36px, рабочие формы) | lg (44px, «входные» экраны — крупнее).
// Для type="password" автоматически показывается кнопка-«глаз» (скрыть/показать).
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
  { label, error, id, className, inputSize = 'md', type, ...rest },
  ref,
): ReactNode {
  const autoId = useId();
  const inputId = id ?? autoId;
  const [revealed, setRevealed] = useState(false);
  const isPassword = type === 'password';
  const effectiveType = isPassword && revealed ? 'text' : type;

  return (
    <div>
      {label && (
        <label htmlFor={inputId} className={`mb-1.5 block text-muted ${labelClasses[inputSize]}`}>
          {label}
        </label>
      )}
      <div className="relative">
        <input
          id={inputId}
          ref={ref}
          type={effectiveType}
          aria-invalid={!!error}
          className={[
            'w-full rounded-md border bg-surface text-ink',
            sizeClasses[inputSize],
            isPassword ? 'pr-10' : '',
            'placeholder:text-faint focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--ring)]',
            error ? 'border-[color:var(--danger)]' : 'border-[var(--border)]',
            className ?? '',
          ].join(' ')}
          {...rest}
        />
        {isPassword && (
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setRevealed((v) => !v)}
            aria-label={revealed ? texts.common.a11y.hidePassword : texts.common.a11y.showPassword}
            aria-pressed={revealed}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-0.5 text-muted hover:text-ink"
          >
            {revealed ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
          </button>
        )}
      </div>
      {error && <p className="mt-1 text-xs text-[color:var(--danger-fg)]">{error}</p>}
    </div>
  );
});
