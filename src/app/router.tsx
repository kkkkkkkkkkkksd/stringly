import { createBrowserRouter, Navigate } from 'react-router-dom';
import { LandingPage } from '@/pages/landing/LandingPage';
import { AuthPage } from '@/pages/auth/AuthPage';
import { OnboardingPage } from '@/pages/onboarding/OnboardingPage';
import { AppLayout } from '@/pages/app/AppLayout';
import { TablePage } from '@/pages/app/TablePage';
import { SettingsLayout } from '@/pages/app/settings/SettingsLayout';
import { PreferencesPage } from '@/pages/app/settings/PreferencesPage';
import { MembersPage } from '@/pages/app/settings/MembersPage';
import { ConnectionsPage } from '@/pages/app/settings/ConnectionsPage';
import { ProjectPage } from '@/pages/app/settings/ProjectPage';
import { ProfilePage } from '@/pages/app/settings/ProfilePage';
import { SettingsStub } from '@/pages/app/settings/SettingsStub';
import { texts } from '@/shared/resources/i18n';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { ProtectedRoute } from '@/app/guards/ProtectedRoute';

const st = texts.app.settings;
import { RequireProject } from '@/app/guards/RequireProject';

// Маршруты (docs/03). Публичные: лендинг, вход/регистрация.
// Защищённые (ProtectedRoute): онбординг и /app. /app дополнительно требует проект.
export const router = createBrowserRouter([
  { path: '/', element: <LandingPage /> },
  { path: '/login', element: <AuthPage /> },
  { path: '/register', element: <AuthPage /> },
  {
    element: <ProtectedRoute />,
    children: [
      { path: '/onboarding', element: <OnboardingPage /> },
      {
        path: '/app',
        element: (
          <RequireProject>
            <AppLayout />
          </RequireProject>
        ),
        children: [
          { index: true, element: <Navigate to="table" replace /> },
          { path: 'table', element: <TablePage /> },
          {
            path: 'settings',
            element: <SettingsLayout />,
            children: [
              { index: true, element: <Navigate to="project" replace /> },
              // Языки переехали во вкладку «Проект»; старый путь редиректим туда же.
              { path: 'languages', element: <Navigate to="../project" replace /> },
              { path: 'members', element: <MembersPage /> },
              { path: 'project', element: <ProjectPage /> },
              { path: 'connections', element: <ConnectionsPage /> },
              {
                path: 'documentation',
                element: (
                  <SettingsStub
                    title={st.documentation.title}
                    description={st.documentation.placeholder}
                  />
                ),
              },
              {
                path: 'history',
                element: (
                  <SettingsStub title={st.history.title} description={st.history.placeholder} />
                ),
              },
              { path: 'profile', element: <ProfilePage /> },
              { path: 'preferences', element: <PreferencesPage /> },
            ],
          },
        ],
      },
    ],
  },
  { path: '*', element: <NotFoundPage /> },
]);
