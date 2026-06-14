import type { ReactNode } from 'react';

// iOS-стиль тумблер (docs/14). Доступный: role="switch" + aria-checked. Управляемый.
export function Switch({
  checked,
  onChange,
  id,
  label,
  disabled,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  id?: string;
  label?: string;
  disabled?: boolean;
}): ReactNode {
  return (
    <button
      type="button"
      role="switch"
      id={id}
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={[
        'relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--ring)]',
        checked ? 'bg-primary' : 'bg-[var(--border-strong)]',
        disabled ? 'cursor-not-allowed opacity-50' : '',
      ].join(' ')}
    >
      <span
        className={[
          'inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform',
          checked ? 'translate-x-5' : 'translate-x-0.5',
        ].join(' ')}
      />
    </button>
  );
}
