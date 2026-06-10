import type { ReactNode } from 'react';

// Сегментный переключатель (docs/14, §5). Используется для «Вход/Регистрация»,
// в будущем — для табов/режимов. Универсален по значению через дженерик.
export function Segmented<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
}): ReactNode {
  return (
    <div className="flex rounded-md bg-subtle p-1">
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(o.value)}
            aria-pressed={active}
            className={[
              'flex-1 rounded px-3 py-1.5 text-[13px] transition-colors',
              active ? 'bg-surface font-medium text-ink shadow-sm' : 'text-muted hover:text-ink',
            ].join(' ')}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
