// Классы кнопки дизайн-системы (см. docs/14, §5). Вынесено отдельно от компонента,
// чтобы переиспользовать на ссылках-кнопках (<Link className={buttonStyles(...)}>).
export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg' | 'xl';

const base =
  'inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors ' +
  'focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--ring)] ' +
  'disabled:opacity-50 disabled:pointer-events-none';

const sizes: Record<ButtonSize, string> = {
  sm: 'h-7 px-3 text-xs',
  md: 'h-9 px-4 text-sm',
  lg: 'h-10 px-5 text-sm',
  xl: 'h-12 px-6 text-base',
};

const variants: Record<ButtonVariant, string> = {
  primary: 'bg-primary text-white hover:bg-primary-hover',
  secondary: 'bg-surface text-ink border border-[var(--border)] hover:bg-subtle',
  ghost: 'text-ink hover:bg-subtle',
  danger: 'text-white hover:opacity-90 bg-[color:var(--danger)]',
};

export function buttonStyles(opts: { variant?: ButtonVariant; size?: ButtonSize } = {}): string {
  const { variant = 'primary', size = 'md' } = opts;
  return [base, sizes[size], variants[variant]].join(' ');
}
