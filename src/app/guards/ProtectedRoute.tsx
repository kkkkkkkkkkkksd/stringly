import type { ReactNode } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useSession } from '@/features/auth/model/sessionStore';

// Пускает дальше только при наличии сессии; иначе — на /login.
export function ProtectedRoute(): ReactNode {
  const token = useSession((s) => s.token);
  if (!token) return <Navigate to="/login" replace />;
  return <Outlet />;
}
