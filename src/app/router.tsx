import { createBrowserRouter, Navigate } from 'react-router-dom';
import { LandingPage } from '@/pages/landing/LandingPage';
import { AuthPage } from '@/pages/auth/AuthPage';
import { OnboardingPage } from '@/pages/onboarding/OnboardingPage';
import { AppLayout } from '@/pages/app/AppLayout';
import { TablePage } from '@/pages/app/TablePage';
import { SettingsPage } from '@/pages/app/SettingsPage';
import { NotFoundPage } from '@/pages/NotFoundPage';
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
          { path: 'settings', element: <SettingsPage /> },
        ],
      },
    ],
  },
  { path: '*', element: <NotFoundPage /> },
]);
