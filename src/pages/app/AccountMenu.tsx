import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Badge,
  InitialAvatar,
  Menu,
  MenuItem,
  MenuLabel,
  MenuSeparator,
  Segmented,
} from '@/shared/ui';
import {
  ChevronDownIcon,
  DocIcon,
  HistoryIcon,
  LogoutIcon,
  PlusIcon,
  SettingsIcon,
  UsersIcon,
  ApiIcon,
  LanguageIcon,
  CheckIcon,
} from '@/shared/resources/assets';
import { texts } from '@/shared/resources/i18n';
import type { ThemeMode } from '@/shared/services/theme';
import { useTheme } from '@/shared/services/theme';
import { useSession } from '@/features/auth/model/sessionStore';
import { useLogout } from '@/features/auth/model/useAuth';
import { useProjects } from '@/features/projects/model/useProjects';
import { useActiveProject } from '@/features/projects/model/activeProjectStore';

const t = texts.app.account;
const pref = texts.app.settings.preferences;

// Меню аккаунта и настроек (правый угол навигации). Объединяет: почту аккаунта,
// переключатель проектов (активный с галочкой), быстрый переход в настройки, выбор темы
// и выход. Это композиция нескольких фич → живёт на уровне pages (не в одной фиче).
export function AccountMenu(): ReactNode {
  const navigate = useNavigate();
  const email = useSession((s) => s.user?.email) ?? '';
  const logout = useLogout();
  const projects = useProjects().data ?? [];
  const activeId = useActiveProject((s) => s.activeProjectId);
  const setActiveProject = useActiveProject((s) => s.setActiveProject);
  const mode = useTheme((s) => s.mode);
  const setMode = useTheme((s) => s.setMode);

  const themeOptions: { value: ThemeMode; label: string }[] = [
    { value: 'light', label: pref.light },
    { value: 'dark', label: pref.dark },
    { value: 'system', label: pref.system },
  ];

  const go = (path: string, close: () => void) => {
    navigate(path);
    close();
  };

  return (
    <Menu
      align="right"
      panelClassName="w-[330px]"
      trigger={({ toggle }) => (
        <button
          type="button"
          onClick={toggle}
          aria-label={texts.app.topnav.account}
          className="flex items-center gap-2 rounded-full border border-[var(--border)] py-1 pl-1 pr-2.5 hover:bg-subtle"
        >
          <InitialAvatar name={email || '?'} size={28} shape="circle" variant="tint" />
          <span className="max-w-[210px] truncate text-[13px] font-medium text-ink">{email}</span>
          <ChevronDownIcon size={14} className="text-faint" />
        </button>
      )}
    >
      {(close) => (
        <>
          <MenuLabel>{email}</MenuLabel>

          {projects.map((p) => (
            <MenuItem
              key={p.id}
              active={p.id === activeId}
              right={p.id === activeId ? <CheckIcon size={16} /> : undefined}
              icon={<InitialAvatar name={p.name} size={22} />}
              onClick={() => {
                if (p.id !== activeId) {
                  setActiveProject(p.id);
                  navigate('/app/table');
                }
                close();
              }}
            >
              <span className="flex flex-col leading-tight">
                <span className="truncate">{p.name}</span>
                <span className="text-xs text-muted">{p.role}</span>
              </span>
            </MenuItem>
          ))}
          <MenuItem icon={<PlusIcon size={16} />} right={t.newProject} disabled>
            {t.newProject}
          </MenuItem>

          <MenuSeparator />

          <MenuItem icon={<SettingsIcon size={16} />} right="⌘," onClick={() => go('/app/settings', close)}>
            {t.settings}
          </MenuItem>
          <MenuItem icon={<UsersIcon size={16} />} onClick={() => go('/app/settings/members', close)}>
            {t.members}
          </MenuItem>
          <MenuItem icon={<LanguageIcon size={16} />} onClick={() => go('/app/settings/project', close)}>
            {t.projectAndLanguages}
          </MenuItem>

          <MenuSeparator />

          <div className="flex items-center gap-3 px-2.5 py-1.5">
            <span className="flex w-5 shrink-0 justify-center text-muted">
              <SettingsIcon size={16} />
            </span>
            <span className="flex-1 text-sm text-ink">{t.themeLabel}</span>
          </div>
          <div className="px-2.5 pb-1.5">
            <Segmented options={themeOptions} value={mode} onChange={setMode} />
          </div>

          <MenuSeparator />

          <MenuItem
            icon={<ApiIcon size={16} />}
            right={<Badge tone="neutral">{t.soon}</Badge>}
            onClick={() => go('/app/settings/connections', close)}
          >
            {t.connections}
          </MenuItem>
          <MenuItem
            icon={<HistoryIcon size={16} />}
            right={<Badge tone="neutral">{t.soon}</Badge>}
            onClick={() => go('/app/settings/history', close)}
          >
            {t.history}
          </MenuItem>
          <MenuItem
            icon={<DocIcon size={16} />}
            right={<Badge tone="neutral">{t.soon}</Badge>}
            onClick={() => go('/app/settings/documentation', close)}
          >
            {t.documentation}
          </MenuItem>

          <MenuSeparator />

          <MenuItem
            icon={<LogoutIcon size={16} />}
            onClick={() => {
              logout();
              navigate('/login');
              close();
            }}
          >
            {t.signOut}
          </MenuItem>
        </>
      )}
    </Menu>
  );
}
