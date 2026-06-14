import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { brand } from '@/shared/config/brand';
import { texts } from '@/shared/resources/i18n';
import {
  TableRowsIcon,
  ApiIcon,
  LanguageIcon,
  SparkleIcon,
  CheckIcon,
  ChevronRightIcon,
} from '@/shared/resources/assets';
import { Logo } from '@/shared/ui';

// Лендинг — направление «Gradient SaaS» (docs/13). Маркетинговый «входной» экран:
// стиль ярче рабочего приложения (градиенты разрешены как исключение, см. docs/14).
// ~3 экрана: тёмный hero с превью редактора → AI-переводы → масштаб → CTA.
// Все тексты — @/shared/resources/i18n, иконки — @/shared/resources/assets.
const t = texts.landing;

const GRADIENT = 'linear-gradient(90deg,#818CF8,#EC4899,#F59E0B)';

// Акценты карточек-фич (мягкая подложка иконки + цвет иконки).
const features = [
  { ...t.features.table, Icon: TableRowsIcon, bg: '#EEF2FF', color: '#4F46E5' },
  { ...t.features.api, Icon: ApiIcon, bg: '#F0FDFA', color: '#0D9488' },
  { ...t.features.languages, Icon: LanguageIcon, bg: '#FCE7F3', color: '#DB2777' },
];

// Акценты карточек-метрик (мягкая цветная подложка + сплошной цветной номер).
const statAccents = [
  { bg: '#F5F3FF', color: '#7C3AED' },
  { bg: '#ECFEFF', color: '#0EA5E9' },
  { bg: '#FFF1F2', color: '#F43F5E' },
  { bg: '#FEFCE8', color: '#F59E0B' },
];

// Превью фокус-редактора (как в приложении), тёмная карточка. AI-строки помечены искрой.
function EditorPreview(): ReactNode {
  return (
    <div className="mt-14 overflow-hidden rounded-2xl border border-white/10 bg-[#0F172A] shadow-2xl">
      <div className="flex gap-1.5 border-b border-white/10 px-4 py-3">
        <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
        <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
        <span className="h-3 w-3 rounded-full bg-[#28c840]" />
      </div>
      <div className="grid grid-cols-[150px_1fr_1fr] border-b border-white/10 bg-white/[0.03] text-[11px] uppercase tracking-wide text-slate-400">
        <div className="px-4 py-2.5">{t.preview.columns.key}</div>
        <div className="px-4 py-2.5">{t.preview.columns.base}</div>
        <div className="px-4 py-2.5">{t.preview.columns.target}</div>
      </div>
      {t.preview.rows.map((r) => (
        <div key={r.code} className="grid grid-cols-[150px_1fr_1fr] border-b border-white/5 last:border-0 text-[13px]">
          <div className="px-4 py-3 font-mono text-[#a5b4fc]">{r.code}</div>
          <div className="px-4 py-3 text-slate-300">{r.base}</div>
          <div className="flex items-center gap-2 px-4 py-3 text-white">
            {r.target}
            {r.ai ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-semibold text-[#c4b5fd]">
                <SparkleIcon size={11} /> {t.preview.aiBadge}
              </span>
            ) : null}
          </div>
        </div>
      ))}
    </div>
  );
}

export function LandingPage(): ReactNode {
  return (
    <div className="scrollbar-none h-full overflow-y-auto bg-white">
      {/* ── Hero (тёмный, с градиентным «блобом») ─────────────────────────── */}
      <section className="relative overflow-hidden bg-[#0B1020] text-white">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-40 -top-52 h-[680px] w-[680px] rounded-full opacity-50 blur-[90px]"
          style={{ background: 'conic-gradient(from 0deg,#7C3AED,#EC4899,#F59E0B,#0EA5E9,#7C3AED)' }}
        />
        <div className="relative mx-auto max-w-5xl px-6">
          <header className="flex items-center justify-between py-5">
            <Logo size={22} tone="inverse" />
            <nav className="flex items-center gap-4">
              <Link to="/login" className="text-sm text-white/80 hover:text-white">
                {t.nav.signIn}
              </Link>
              <Link
                to="/register"
                className="inline-flex h-9 items-center rounded-full bg-white px-4 text-sm font-semibold text-[#0B1020] hover:bg-white/90"
              >
                {t.nav.signUp}
              </Link>
            </nav>
          </header>

          <div className="pb-24 pt-16">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-sm font-semibold">
              <SparkleIcon size={15} /> {t.hero.badge}
            </span>
            <h1 className="mt-6 text-[clamp(40px,6vw,76px)] font-extrabold leading-[1.04] tracking-tight">
              <span className="whitespace-pre-line">{t.hero.title} </span>
              <span style={{ background: GRADIENT, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}>
                {t.hero.titleAccent}
              </span>
            </h1>
            <p className="mt-5 max-w-xl text-lg text-slate-300">{t.hero.subtitle}</p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                to="/register"
                className="inline-flex h-12 items-center gap-2 rounded-full bg-white px-7 text-base font-bold text-[#0B1020] hover:bg-white/90"
              >
                {t.hero.ctaPrimary} <ChevronRightIcon size={18} />
              </Link>
              <Link
                to="/login"
                className="inline-flex h-12 items-center rounded-full border border-white/25 bg-white/10 px-7 text-base font-semibold text-white hover:bg-white/15"
              >
                {t.hero.ctaSecondary}
              </Link>
            </div>
            <EditorPreview />
          </div>
        </div>
      </section>

      {/* ── AI-переводы ───────────────────────────────────────────────────── */}
      <section className="mx-auto grid max-w-5xl items-center gap-12 px-6 py-24 md:grid-cols-2">
        <div>
          <span className="text-[13px] font-bold uppercase tracking-[0.08em] text-[#7C3AED]">
            {t.ai.eyebrow}
          </span>
          <h2 className="mt-3 text-[clamp(28px,4vw,42px)] font-extrabold leading-[1.1] text-[#0F172A]">
            {t.ai.title}{' '}
            <span style={{ background: GRADIENT, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}>
              {t.ai.titleAccent}
            </span>
          </h2>
          <p className="mt-4 text-lg text-[#475569]">{t.ai.subtitle}</p>
          <ul className="mt-7 space-y-3">
            {t.ai.points.map((p) => (
              <li key={p.title} className="flex items-start gap-3">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#EDE9FE] text-[#7C3AED]">
                  <CheckIcon size={15} />
                </span>
                <span>
                  <span className="font-semibold text-[#0F172A]">{p.title}</span>{' '}
                  <span className="text-[#475569]">— {p.desc}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Визуал: базовая строка → AI разливает её на языки */}
        <div className="rounded-3xl border border-[#eee] bg-gradient-to-br from-[#F5F3FF] to-white p-8">
          <div className="rounded-xl border border-[#e9e5ff] bg-white px-4 py-3 text-sm">
            <span className="font-mono text-[11px] text-[#94A3B8]">en · {t.ai.flowBase}</span>
            <div className="mt-1 font-semibold text-[#0F172A]">Hello</div>
          </div>
          <div className="my-4 flex items-center justify-center gap-2 text-[#7C3AED]">
            <SparkleIcon size={18} />
            <span className="text-sm font-semibold">AI</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {t.ai.flowChips.map((c) => (
              <span
                key={c}
                className="inline-flex items-center gap-1.5 rounded-full border border-[#e9e5ff] bg-white px-3 py-1.5 text-sm font-semibold text-[#0F172A]"
              >
                <SparkleIcon size={12} className="text-[#c4b5fd]" />
                {c}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Масштаб + фичи ────────────────────────────────────────────────── */}
      <section className="bg-[#FAFAFF]">
        <div className="mx-auto max-w-5xl px-6 py-24">
          <span className="text-[13px] font-bold uppercase tracking-[0.08em] text-[#4F46E5]">
            {t.scale.eyebrow}
          </span>
          <h2 className="mt-3 max-w-2xl text-[clamp(28px,4vw,44px)] font-extrabold leading-[1.08] text-[#0F172A]">
            {t.scale.title}
          </h2>
          <p className="mt-4 max-w-xl text-lg text-[#475569]">{t.scale.subtitle}</p>

          <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {t.scale.stats.map((s, i) => {
              const a = statAccents[i % statAccents.length];
              return (
                <div key={s.label} className="rounded-2xl p-6" style={{ background: a.bg }}>
                  <div className="text-[34px] font-extrabold leading-none" style={{ color: a.color }}>
                    {s.value}
                  </div>
                  <div className="mt-2 text-sm text-[#475569]">{s.label}</div>
                </div>
              );
            })}
          </div>

          <div className="mt-12 grid gap-5 sm:grid-cols-3">
            {features.map((f) => (
              <div
                key={f.title}
                className="rounded-2xl border border-[#eef0f4] bg-white p-6 transition-shadow hover:shadow-md"
              >
                <div
                  className="flex h-11 w-11 items-center justify-center rounded-xl"
                  style={{ background: f.bg, color: f.color }}
                >
                  <f.Icon size={20} />
                </div>
                <h3 className="mt-4 text-base font-semibold text-[#0F172A]">{f.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-[#475569]">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-5xl px-6 py-20">
        <div
          className="rounded-3xl px-8 py-16 text-center text-white"
          style={{ background: 'linear-gradient(120deg,#4F46E5,#7C3AED)' }}
        >
          <h2 className="mx-auto max-w-2xl text-[clamp(28px,4vw,46px)] font-extrabold leading-[1.08]">
            {t.cta.title}
          </h2>
          <p className="mt-4 text-lg text-white/85">{t.cta.subtitle}</p>
          <Link
            to="/register"
            className="mt-8 inline-flex h-12 items-center rounded-full bg-white px-8 text-base font-bold text-[#4338CA] hover:bg-white/90"
          >
            {t.cta.button}
          </Link>
        </div>
      </section>

      <footer className="border-t border-[#E2E8F0] px-6 py-6 text-center text-xs text-[#94A3B8]">
        © {new Date().getFullYear()} {brand.name}. {brand.tagline}.
      </footer>
    </div>
  );
}
