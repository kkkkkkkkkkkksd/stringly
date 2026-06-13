import { useEffect, useRef, useState, type ReactNode } from 'react';

// Переиспользуемое выпадающее меню/поповер (docs/14): триггер + панель под ним.
// Закрытие по клику вне и Esc. Якорится к триггеру (align: справа/слева).
// Router-agnostic: пункты — обычные кнопки (навигацию делает вызывающий через onClick),
// чтобы shared/ui не зависел от роутера.
type Align = 'left' | 'right';

export function Menu({
  trigger,
  children,
  align = 'right',
  panelClassName,
}: {
  trigger: (props: { open: boolean; toggle: () => void }) => ReactNode;
  children: ReactNode | ((close: () => void) => ReactNode);
  align?: Align;
  panelClassName?: string;
}): ReactNode {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const close = () => setOpen(false);

  return (
    <div ref={ref} className="relative">
      {trigger({ open, toggle: () => setOpen((o) => !o) })}
      {open ? (
        <div
          role="menu"
          className={[
            'absolute top-[calc(100%+6px)] z-50 min-w-[280px] rounded-lg border border-[var(--border-strong)] bg-surface p-1.5 shadow-pop',
            align === 'right' ? 'right-0' : 'left-0',
            panelClassName ?? '',
          ].join(' ')}
        >
          {typeof children === 'function' ? children(close) : children}
        </div>
      ) : null}
    </div>
  );
}

// Пункт меню: иконка + содержимое + опциональный правый слот (хинт/бейдж/галочка).
export function MenuItem({
  icon,
  children,
  right,
  onClick,
  disabled,
  active,
}: {
  icon?: ReactNode;
  children: ReactNode;
  right?: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  active?: boolean;
}): ReactNode {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      disabled={disabled}
      aria-current={active ? 'true' : undefined}
      className={[
        'flex w-full items-center gap-3 rounded-md px-2.5 py-2 text-left text-sm transition-colors',
        active ? 'text-primary-hover' : 'text-ink',
        disabled ? 'cursor-not-allowed opacity-55' : 'hover:bg-subtle',
      ].join(' ')}
    >
      {icon ? <span className="flex w-5 shrink-0 justify-center text-muted">{icon}</span> : null}
      <span className="min-w-0 flex-1">{children}</span>
      {right ? <span className="ml-auto shrink-0 text-xs text-faint">{right}</span> : null}
    </button>
  );
}

export function MenuSeparator(): ReactNode {
  return <div className="my-1.5 h-px bg-[var(--border)]" role="separator" />;
}

export function MenuLabel({ children }: { children: ReactNode }): ReactNode {
  return <p className="truncate px-2.5 pb-1 pt-1.5 text-[12.5px] text-faint">{children}</p>;
}
