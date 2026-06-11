import type { ReactNode } from 'react';
import { Card, Segmented } from '@/shared/ui';
import { texts } from '@/shared/resources/i18n';
import { useTheme, type ThemeMode } from '@/shared/services/theme';

const t = texts.app.settings.preferences;

// Предпочтения: переключатель темы (светлая / тёмная / системная). Применяется сразу,
// выбор запоминается (см. shared/services/theme).
export function PreferencesPage(): ReactNode {
  const mode = useTheme((s) => s.mode);
  const setMode = useTheme((s) => s.setMode);

  return (
    <div className="max-w-xl space-y-4">
      <h2 className="text-lg font-medium text-ink">{t.title}</h2>
      <Card>
        <div className="text-sm font-medium text-ink">{t.themeLabel}</div>
        <p className="mb-3 mt-0.5 text-sm text-muted">{t.themeHint}</p>
        <div className="max-w-xs">
          <Segmented<ThemeMode>
            value={mode}
            onChange={setMode}
            options={[
              { value: 'light', label: t.light },
              { value: 'dark', label: t.dark },
              { value: 'system', label: t.system },
            ]}
          />
        </div>
      </Card>
    </div>
  );
}
