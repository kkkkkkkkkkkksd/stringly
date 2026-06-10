import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { brand } from '@/shared/config/brand';
import { texts } from '@/shared/resources/i18n';
import { TableRowsIcon, ApiIcon, LanguageIcon } from '@/shared/resources/assets';
import { Badge, Logo, buttonStyles } from '@/shared/ui';

// Лендинг — Вариант 2 «Сплит» (текст + превью таблицы), один экран.
// Тексты — @/shared/resources/i18n, иконки — @/shared/resources/assets. Спека — docs/03.
const t = texts.landing;

const features = [
  { ...t.features.table, Icon: TableRowsIcon },
  { ...t.features.api, Icon: ApiIcon },
  { ...t.features.languages, Icon: LanguageIcon },
];

const previewRows = [
  { code: '[copy]', en: 'Copy', ru: 'Копировать' },
  { code: '[close]', en: 'Close', ru: 'Закрыть' },
  { code: '[try_again]', en: 'Try Again', ru: 'Попробуйте ещё раз' },
  { code: '[not_found]', en: 'Not found', ru: 'Ничего не найдено' },
];

function TablePreview() {
  return (
    <div className="overflow-hidden rounded-lg border border-[var(--border)] bg-surface shadow-sm">
      <div className="flex gap-2 border-b border-[var(--border)] px-3 py-2">
        {t.preview.tabs.map((tab, i) => (
          <span
            key={tab}
            className={
              i === 0
                ? 'rounded-md bg-primary px-2 py-1 text-[11px] font-medium text-white'
                : 'rounded-md px-2 py-1 text-[11px] text-muted'
            }
          >
            {tab}
          </span>
        ))}
      </div>
      <table className="w-full border-collapse">
        <thead>
          <tr>
            {t.preview.columns.map((h) => (
              <th
                key={h}
                className="border-b border-[var(--border)] px-3 py-2 text-left text-[11px] font-medium text-muted"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {previewRows.map((r) => (
            <tr key={r.code}>
              <td className="border-b border-[var(--border)] px-3 py-2 font-mono text-xs text-primary-hover">
                {r.code}
              </td>
              <td className="border-b border-[var(--border)] px-3 py-2 text-xs text-ink">{r.en}</td>
              <td className="border-b border-[var(--border)] px-3 py-2 text-xs text-ink">{r.ru}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function LandingPage(): ReactNode {
  return (
    <div className="flex min-h-full flex-col">
      <header className="border-b border-[var(--border)] bg-surface">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <Logo size={22} />
          <nav className="flex items-center gap-3">
            <Link to="/login" className="text-sm text-muted hover:text-ink">
              {t.nav.signIn}
            </Link>
            <Link to="/register" className={buttonStyles({ variant: 'primary', size: 'md' })}>
              {t.nav.signUp}
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto grid w-full max-w-5xl flex-1 items-center gap-10 px-6 py-20 md:grid-cols-2">
        <div>
          <Badge tone="primary" pill>
            {t.badge}
          </Badge>
          <h1 className="mt-5 text-4xl font-semibold leading-[1.1] text-ink md:text-5xl">
            {t.title}
          </h1>
          <p className="mt-4 max-w-md text-lg text-muted">{t.subtitle}</p>
          <div className="mt-8 flex items-center gap-3">
            <Link to="/register" className={buttonStyles({ variant: 'primary', size: 'xl' })}>
              {t.ctaPrimary}
            </Link>
            <Link to="/login" className={buttonStyles({ variant: 'secondary', size: 'xl' })}>
              {t.ctaSecondary}
            </Link>
          </div>
        </div>
        <TablePreview />
      </main>

      <section className="border-t border-[var(--border)] bg-surface">
        <div className="mx-auto grid w-full max-w-5xl gap-8 px-6 py-12 sm:grid-cols-3">
          {features.map((f) => (
            <div key={f.title}>
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary-tint text-primary-hover">
                <f.Icon size={20} />
              </div>
              <h3 className="mt-4 text-base font-medium text-ink">{f.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-[var(--border)] px-6 py-5 text-center text-xs text-faint">
        © {new Date().getFullYear()} {brand.name}. {brand.tagline}.
      </footer>
    </div>
  );
}
