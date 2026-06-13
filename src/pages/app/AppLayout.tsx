import type { ReactNode } from 'react';
import { Outlet } from 'react-router-dom';
import { TopNav } from './TopNav';

// Каркас рабочей области: горизонтальная навигация сверху + контент. Левый сайдбар убран —
// приложение по сути и есть таблица, а настройки/проекты/выход живут в меню аккаунта
// (TopNav → AccountMenu). Так вся ширина уходит под данные.
export function AppLayout(): ReactNode {
  return (
    <div className="flex h-full min-h-0 flex-col">
      <TopNav />
      <main className="min-h-0 flex-1 overflow-hidden p-6">
        <Outlet />
      </main>
    </div>
  );
}
