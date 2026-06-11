import { createBrowserRouter, Navigate } from 'react-router-dom';
import { LandingPage } from '@/pages/landing/LandingPage';
import { AuthPage } from '@/pages/auth/AuthPage';
import { OnboardingPage } from '@/pages/onboarding/OnboardingPage';
import { AppLayout } from '@/pages/app/AppLayout';
import { TablePage } from '@/pages/app/TablePage';
import { SettingsLayout } from '@/pages/app/settings/SettingsLayout';
import { PreferencesPage } from '@/pages/app/settings/PreferencesPage';
import { SettingsStub } from '@/pages/app/settings/SettingsStub';
import { texts } from '@/shared/resources/i18n';
import { NotFoundPage } from '@/pages/NotFoundPage';

const st = texts.app.settings;
import { ProtectedRoute } from '@/app/guards/ProtectedRoute';
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
              { index: true, element: <Navigate to="languages" replace /> },
              {
                path: 'languages',
                element: (
                  <SettingsStub title={st.languages.title} description={st.languages.placeholder} />
                ),
              },
              {
                path: 'members',
                element: (
                  <SettingsStub title={st.members.title} description={st.members.placeholder} />
                ),
              },
              {
                path: 'connections',
                element: (
                  <SettingsStub
                    title={st.connections.title}
                    description={st.connections.placeholder}
                  />
                ),
              },
              {
                path: 'profile',
                element: (
                  <SettingsStub title={st.profile.title} description={st.profile.placeholder} />
                ),
              },
              { path: 'preferences', element: <PreferencesPage /> },
            ],
          },
        ],
      },
    ],
  },
  { path: '*', element: <NotFoundPage /> },
]);
