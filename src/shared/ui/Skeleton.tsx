import type { ReactNode } from 'react';

// Скелет-плейсхолдер дизайн-системы. Используется на время загрузки (таблица, списки).
export function Skeleton({ className = '' }: { className?: string }): ReactNode {
  return <div className={`animate-pulse rounded bg-subtle ${className}`} aria-hidden="true" />;
}
