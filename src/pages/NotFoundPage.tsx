import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { texts } from '@/shared/resources/i18n';

const t = texts.app.notFound;

// 404 в стиле продукта: «потерянный ключ» — страница как непереведённая строка локализации.
// Тёмный экран с градиентным акцентом; mono-ключ [page_not_found] как в таблице.
export function NotFoundPage(): ReactNode {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0B1020] px-6 py-20 text-white">
      <div className="w-full max-w-lg text-center">
        <p className="text-[13px] font-semibold uppercase tracking-[0.12em] text-[#a5b4fc]">
          {t.eyebrow}
        </p>
        <div
          className="mt-4 font-mono text-[clamp(28px,6vw,52px)] font-bold"
          style={{
            background: 'linear-gradient(90deg,#818CF8,#EC4899,#F59E0B)',
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            color: 'transparent',
          }}
        >
          {t.key}
        </div>
        <h1 className="mt-6 text-2xl font-bold">{t.title}</h1>
        <p className="mx-auto mt-3 max-w-md text-slate-300">{t.text}</p>
        <Link
          to="/"
          className="mt-8 inline-flex h-11 items-center rounded-full bg-white px-7 text-sm font-bold text-[#0B1020] hover:bg-white/90"
        >
          ← {t.back}
        </Link>
      </div>
    </div>
  );
}
