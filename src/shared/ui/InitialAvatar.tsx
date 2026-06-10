import type { ReactNode } from 'react';

// Квадрат-аватар с первой буквой имени (проект, пользователь…). Переиспользуемый.
export function InitialAvatar({
  name,
  size = 24,
}: {
  name: string;
  size?: number;
}): ReactNode {
  const letter = (name.trim()[0] ?? '?').toUpperCase();
  return (
    <span
      aria-hidden="true"
      style={{ width: size, height: size, fontSize: Math.round(size * 0.5) }}
      className="flex shrink-0 items-center justify-center rounded-md bg-primary font-semibold text-white"
    >
      {letter}
    </span>
  );
}
