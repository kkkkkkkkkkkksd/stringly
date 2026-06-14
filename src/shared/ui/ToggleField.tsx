import type { ReactNode } from 'react';
import { Switch } from './Switch';

// Строка-настройка: иконка + подпись + подсказка слева, тумблер справа (docs/14).
// Переиспользуется в модалках (AI-доперевод при создании ключа / добавлении языка).
export function ToggleField({
  label,
  hint,
  checked,
  onChange,
  icon,
  disabled,
}: {
  label: string;
  hint?: string;
  checked: boolean;
  onChange: (value: boolean) => void;
  icon?: ReactNode;
  disabled?: boolean;
}): ReactNode {
  return (
    <div className="flex items-start justify-between gap-3 rounded-md border border-[var(--border)] bg-subtle px-3 py-2.5">
      <div className="min-w-0">
        <div className="flex items-center gap-1.5 text-sm font-medium text-ink">
          {icon}
          {label}
        </div>
        {hint ? <p className="mt-0.5 text-xs text-muted">{hint}</p> : null}
      </div>
      <Switch checked={checked} onChange={onChange} label={label} disabled={disabled} />
    </div>
  );
}
