import type { ReactNode } from 'react';
import { SoonCard } from '@/shared/ui';
import { texts } from '@/shared/resources/i18n';

const t = texts.app.settings.connections;

// Настройки → Подключения. ЗАГЛУШКА (MVP): выпуск API-токенов реализуем позже.
// Точка подключения готова: ключи кэша qk.tokens(pid) и контракт ApiToken (docs/06, 07)
// уже заложены — останется добавить features/tokens (list/create/revoke) поверх.
export function ConnectionsPage(): ReactNode {
  return (
    <div className="max-w-2xl space-y-4">
      <header>
        <h2 className="text-lg font-medium text-ink">{t.title}</h2>
        <p className="mt-0.5 text-sm text-muted">{t.subtitle}</p>
      </header>
      <SoonCard title={t.cardTitle} text={t.soonText} />
    </div>
  );
}
