import { useEffect } from 'react';
import { useBlocker } from 'react-router-dom';
import { texts } from '@/shared/resources/i18n';

// Guard на уход со страницы при несохранённых правках (docs/08):
// beforeunload (закрытие/перезагрузка вкладки) + router-blocker (навигация внутри SPA).
export function useUnsavedGuard(active: boolean): void {
  useEffect(() => {
    if (!active) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [active]);

  const blocker = useBlocker(active);
  useEffect(() => {
    if (blocker.state !== 'blocked') return;
    if (window.confirm(texts.app.table.saveBar.leaveConfirm)) blocker.proceed();
    else blocker.reset();
  }, [blocker]);
}
