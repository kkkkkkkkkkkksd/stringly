import type { ReactNode } from 'react';

// Аватар с первой буквой имени (проект, пользователь…). Переиспользуемый.
// shape: square (по умолчанию, проекты) | circle (аккаунт). variant: solid | tint.
export function InitialAvatar({
  name,
  size = 24,
  shape = 'square',
  variant = 'solid',
}: {
  name: string;
  size?: number;
  shape?: 'square' | 'circle';
  variant?: 'solid' | 'tint';
}): ReactNode {
  const letter = (name.trim()[0] ?? '?').toUpperCase();
  return (
    <span
      aria-hidden="true"
      style={{ width: size, height: size, fontSize: Math.round(size * 0.5) }}
      className={[
        'flex shrink-0 items-center justify-center font-semibold',
        shape === 'circle' ? 'rounded-full' : 'rounded-md',
        variant === 'tint' ? 'bg-primary-tint text-primary-hover' : 'bg-primary text-white',
      ].join(' ')}
    >
      {letter}
    </span>
  );
}
