import type { ReactNode } from 'react';

// Тонкий индикатор прогресса (docs/14). Переиспользуемый: рейл прогресса языков и т.п.
// Значение 0..100 (округляется и клампится). Цвет — success по умолчанию.
export function ProgressBar({
  value,
  tone = 'success',
  className,
}: {
  value: number;
  tone?: 'success' | 'primary';
  className?: string;
}): ReactNode {
  const pct = Math.max(0, Math.min(100, Math.round(value)));
  return (
    <div
      className={['h-1.5 overflow-hidden rounded-full bg-subtle', className ?? ''].join(' ')}
      role="presentation"
    >
      <div
        className="h-full rounded-full"
        style={{ width: `${pct}%`, background: tone === 'primary' ? 'var(--primary)' : 'var(--success)' }}
      />
    </div>
  );
}
