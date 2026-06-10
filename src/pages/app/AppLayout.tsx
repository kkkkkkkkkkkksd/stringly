import type { ReactNode } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Logo } from '@/shared/ui';
import { texts } from '@/shared/resources/i18n';
import { useSession } from '@/features/auth/model/sessionStore';
import { useLogout } from '@/features/auth/model/useAuth';

const t = texts.app;

// Каркас рабочей области: левая панель + контент.
// TODO(Шаг 2): рабочий переключатель проектов вместо заглушки.
const navItem = ({ isActive }: { isActive: boolean }) =>
  [
    'block rounded-md px-3 py-2 text-sm',
    isActive ? 'bg-primary-tint text-primary-hover font-medium' : 'text-muted hover:bg-subtle',
  ].join(' ');

export function AppLayout(): ReactNode {
  const navigate = useNavigate();
  const user = useSession((s) => s.user);
  const logout = useLogout();

  return (
    <div className="grid min-h-full grid-cols-[240px_1fr]">
      <aside className="flex flex-col border-r border-[var(--border)] bg-surface p-3">
        <div className="mb-4 px-1">
          <Logo />
        </div>
        <div className="mb-4 flex items-center justify-between rounded-md border border-[var(--border)] px-3 py-2 text-sm text-ink">
          <span>Mobile App</span>
          <span className="text-xs text-faint">{t.projectSwitcher.soon}</span>
        </div>
        <nav className="space-y-1">
          <NavLink to="/app/table" className={navItem}>
            {t.nav.table}
          </NavLink>
          <NavLink to="/app/settings" className={navItem}>
            {t.nav.settings}
          </NavLink>
        </nav>

        <div className="mt-auto border-t border-[var(--border)] pt-3">
          <p className="truncate px-1 text-xs text-muted">{user?.email}</p>
          <button
            type="button"
            onClick={() => {
              logout();
              navigate('/login');
            }}
            className="mt-1 block w-full rounded-md px-3 py-2 text-left text-sm text-muted hover:bg-subtle"
          >
            {texts.common.actions.signOut}
          </button>
        </div>
      </aside>
      <main className="p-6">
        <Outlet />
      </main>
    </div>
  );
}
