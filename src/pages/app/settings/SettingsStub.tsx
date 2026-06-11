import type { ReactNode } from 'react';
import { SoonCard } from '@/shared/ui';

// Заглушка раздела настроек (видимый, но пока без наполнения). Единый вид через SoonCard —
// без своей вёрстки. Используется для вкладок «Документация» и «История изменений».
export function SettingsStub({ title, description }: { title: string; description: string }): ReactNode {
  return (
    <div className="max-w-2xl">
      <SoonCard title={title} text={description} />
    </div>
  );
}
