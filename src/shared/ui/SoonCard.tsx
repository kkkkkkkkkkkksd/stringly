import type { ReactNode } from 'react';
import { Card } from './Card';
import { Badge } from './Badge';
import { texts } from '@/shared/resources/i18n';

// Карточка-заглушка «скоро»: заголовок + бейдж «Скоро» + пояснение. Единый вид для
// будущих, ещё не реализованных настроек (язык интерфейса, формат экспорта, и т.п.).
// Опционально — действие (обычно задизейбленная кнопка).
export function SoonCard({
  title,
  text,
  action,
}: {
  title: string;
  text: string;
  action?: ReactNode;
}): ReactNode {
  return (
    <Card>
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-ink">{title}</span>
        <Badge tone="warning">{texts.common.state.soon}</Badge>
      </div>
      <p className="mt-1 text-sm text-muted">{text}</p>
      {action ? <div className="mt-3">{action}</div> : null}
    </Card>
  );
}
