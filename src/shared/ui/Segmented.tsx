import type { ReactNode } from 'react';

// Сегментный переключатель (docs/14, §5). size: md (обычный) | lg (крупнее, входные экраны).
type SegmentedSize = 'md' | 'lg';
const itemSize: Record<SegmentedSize, string> = {
  md: 'px-3 py-1.5 text-[13px]',
  lg: 'px-3 py-2 text-sm',
};

export function Segmented<T extends string>({
  options,
  value,
  onChange,
  size = 'md',
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
  size?: SegmentedSize;
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
              'flex-1 rounded transition-colors',
              itemSize[size],
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
