import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Logo } from '@/shared/ui';
import { SearchIcon } from '@/shared/resources/assets';
import { texts } from '@/shared/resources/i18n';
import { useCurrentProject } from '@/features/projects/model/access';
import { AccountMenu } from './AccountMenu';

const tt = texts.app.table.toolbar;

// Горизонтальная навигация приложения (вместо левого сайдбара): бренд (→ таблица),
// контекст активного проекта, поиск-заглушка и меню аккаунта/настроек справа.
// Освобождает всю ширину под данные таблицы (важно при многих языках/длинном тексте).
export function TopNav(): ReactNode {
  const project = useCurrentProject();

  return (
    <header className="flex h-14 shrink-0 items-center gap-4 border-b border-[var(--border)] bg-surface px-4">
      <Link to="/app/table" title={texts.app.topnav.brandTitle} className="shrink-0">
        <Logo size={18} />
      </Link>
      {project ? (
        <span className="hidden items-center gap-2 rounded-md border border-[var(--border)] px-2.5 py-1.5 text-[13px] font-medium text-ink sm:flex">
          {project.name}
        </span>
      ) : null}

      <div className="ml-auto flex items-center gap-3">
        <div className="relative hidden md:block" title={tt.searchSoon}>
          <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-faint">
            <SearchIcon size={16} />
          </span>
          <input
            type="search"
            disabled
            placeholder={tt.searchPlaceholder}
            className="h-9 w-64 cursor-not-allowed rounded-md border border-[var(--border)] bg-page pl-8 pr-3 text-sm text-ink opacity-60 placeholder:text-faint"
          />
        </div>
        <AccountMenu />
      </div>
    </header>
  );
}
