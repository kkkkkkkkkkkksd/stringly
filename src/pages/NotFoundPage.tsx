import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { texts } from '@/shared/resources/i18n';

const t = texts.app.notFound;

export function NotFoundPage(): ReactNode {
  return (
    <div className="mx-auto max-w-sm px-6 py-20 text-center">
      <h1 className="text-2xl font-semibold text-ink">{t.title}</h1>
      <p className="mt-2 text-sm text-muted">{t.text}</p>
      <Link to="/" className="mt-6 inline-block text-sm text-primary hover:underline">
        {texts.common.actions.back}
      </Link>
    </div>
  );
}
