import type { ReactNode } from 'react';

// Бейдж/пилюля дизайн-системы (см. docs/14, §5). Используется для тегов и статусов
// переводов (reviewed/draft/empty → tone success/primary/neutral).
export type BadgeTone = 'primary' | 'neutral' | 'success' | 'warning' | 'danger' | 'info';

const tones: Record<BadgeTone, string> = {
  primary: 'bg-[color:var(--primary-tint)] text-[color:var(--primary-hover)]',
  neutral: 'bg-subtle text-muted',
  success: 'bg-[color:var(--success-tint)] text-[color:var(--success-fg)]',
  warning: 'bg-[color:var(--warning-tint)] text-[color:var(--warning-fg)]',
  danger: 'bg-[color:var(--danger-tint)] text-[color:var(--danger-fg)]',
  info: 'bg-[color:var(--info-tint)] text-[color:var(--info-fg)]',
};

export function Badge({
  tone = 'neutral',
  pill = false,
  children,
}: {
  tone?: BadgeTone;
  pill?: boolean;
  children: ReactNode;
}): ReactNode {
  return (
    <span
      className={[
        'inline-flex items-center text-xs font-medium px-2.5 py-1',
        pill ? 'rounded-full' : 'rounded-md',
        tones[tone],
      ].join(' ')}
    >
      {children}
    </span>
  );
}
