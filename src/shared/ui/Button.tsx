import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { buttonStyles, type ButtonSize, type ButtonVariant } from './buttonStyles';

// Базовая кнопка дизайн-системы (см. docs/14, §5).
// Для ссылок-кнопок используй buttonStyles() на <Link className={...}>.
type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: ReactNode;
};

export function Button({ variant, size, className, children, ...rest }: ButtonProps): ReactNode {
  return (
    <button className={`${buttonStyles({ variant, size })} ${className ?? ''}`} {...rest}>
      {children}
    </button>
  );
}
