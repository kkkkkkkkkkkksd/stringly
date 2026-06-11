import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from '@/app/App';
import { env } from '@/shared/config/env';
import { initTheme } from '@/shared/services/theme';
import './index.css';

// Применяем сохранённую/системную тему до рендера (без мигания).
initTheme();

// Пока нет бэка — поднимаем MSW (мок-сеть) прямо в браузере.
// При VITE_API_MODE=real моки не запускаются.
async function enableMocking() {
  if (!env.isMock) return;
  const { worker } = await import('@/mocks/browser');
  await worker.start({ onUnhandledRequest: 'bypass' });
}

enableMocking().then(() => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
});
