import type { ReactNode } from 'react';

// Заглушка раздела настроек (видимый, но пока без наполнения). Точка подключения готова —
// контент Языков/Участников и т.д. добавляется на соответствующих шагах.
export function SettingsStub({ title, description }: { title: string; description: string }): ReactNode {
  return (
    <div className="max-w-xl space-y-2">
      <h2 className="text-lg font-medium text-ink">{title}</h2>
      <p className="text-sm text-muted">{description}</p>
    </div>
  );
}
