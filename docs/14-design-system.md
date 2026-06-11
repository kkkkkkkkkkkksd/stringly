# 14. Дизайн-система (ЗАФИКСИРОВАНО) — Indigo & Slate

> **Источник правды по визуалу.** Любая UI-задача обращается сюда: цвета, шрифты,
> отступы, радиусы, компоненты. Не вводи цвета/размеры «от себя» — бери токены отсюда.
> Направление: **A · Indigo & Slate**. Шрифт: **Inter** (+ JetBrains Mono для ключей/кода).
> Темы: **светлая и тёмная** обязательны (через CSS-переменные).

## Принципы

- Плоско и чисто: без градиентов, тяжёлых теней, неона. Тонкие границы, много воздуха.
- Инструмент для работы: плотность данных важнее декора, но без шума.
- Акцент (indigo) — только для действий и активных состояний, не для «красоты».
- Все цвета работают в обеих темах. Текст на цветной заливке — тёмный из той же семьи.

---

## 1. Палитра (сырые ramp'ы)

### Primary — Indigo
| Stop | HEX | | Stop | HEX |
|----|-------|-|----|-------|
| 50 | `#EEF2FF` | | 500 | `#6366F1` |
| 100 | `#E0E7FF` | | 600 | `#4F46E5` ← основной |
| 200 | `#C7D2FE` | | 700 | `#4338CA` ← hover |
| 300 | `#A5B4FC` | | 800 | `#3730A3` |
| 400 | `#818CF8` | | 900 | `#312E81` |

### Neutral — Slate
| Stop | HEX | | Stop | HEX |
|----|-------|-|----|-------|
| 50 | `#F8FAFC` | | 500 | `#64748B` |
| 100 | `#F1F5F9` | | 600 | `#475569` |
| 200 | `#E2E8F0` | | 700 | `#334155` |
| 300 | `#CBD5E1` | | 800 | `#1E293B` |
| 400 | `#94A3B8` | | 900 | `#0F172A` |
| | | | 950 | `#020617` |

### Семантика (по ролям)
| Роль | 50 | 100 | 600 | text |
|------|----|-----|-----|------|
| success | `#F0FDF4` | `#DCFCE7` | `#16A34A` | `#166534` |
| warning | `#FFFBEB` | `#FEF3C7` | `#D97706` | `#92400E` |
| danger | `#FEF2F2` | `#FEE2E2` | `#DC2626` | `#991B1B` |
| info | `#EFF6FF` | `#DBEAFE` | `#2563EB` | `#1D4ED8` |

### Статусы перевода (из `06-data-model`)
| Статус | Light bg / text | Dark bg / text |
|--------|------------------|-----------------|
| `reviewed` | `#DCFCE7` / `#166534` | `#052E16` / `#86EFAC` |
| `draft` | `#EEF2FF` / `#4338CA` | `#1E1B4B` / `#A5B4FC` |
| `empty` | `#F1F5F9` / `#64748B` | `#1E293B` / `#94A3B8` |

---

## 2. Семантические токены (CSS-переменные)

Готово к вставке в `shared/ui/tokens.css`. Компоненты используют **только** эти переменные,
не сырые hex. Тёмная тема — через `[data-theme="dark"]` (или `prefers-color-scheme`).

```css
:root {
  /* surfaces */
  --bg-page:        #F8FAFC;
  --bg-surface:     #FFFFFF;
  --bg-subtle:      #F1F5F9;
  --bg-hover:       #F1F5F9;
  /* borders */
  --border:         #E2E8F0;
  --border-strong:  #CBD5E1;
  /* text */
  --text-primary:   #0F172A;
  --text-secondary: #64748B;
  --text-tertiary:  #94A3B8;
  --text-inverse:   #FFFFFF;
  /* brand */
  --primary:        #4F46E5;
  --primary-hover:  #4338CA;
  --primary-fg:     #FFFFFF;
  --primary-tint:   #EEF2FF;
  --ring:           rgba(99,102,241,.35);
  /* semantic */
  --success: #16A34A; --success-tint: #DCFCE7; --success-fg: #166534;
  --warning: #D97706; --warning-tint: #FEF3C7; --warning-fg: #92400E;
  --danger:  #DC2626; --danger-tint:  #FEE2E2; --danger-fg:  #991B1B;
  --info:    #2563EB; --info-tint:    #DBEAFE; --info-fg:    #1D4ED8;
  /* table editing */
  --cell-dirty-bg:     #EEF2FF;
  --cell-dirty-border: #4F46E5;
  /* hover строки (индиго, бренд) и пустая ячейка — разные цвета, чтобы не сливались */
  --row-hover:         #EEF2FF;
  --cell-empty:        #F1F5F9;
  --cell-empty-hover:  #E2E8F0;
}

[data-theme="dark"] {
  --bg-page:        #020617;
  --bg-surface:     #0F172A;
  --bg-subtle:      #1E293B;
  --bg-hover:       #1E293B;
  --border:         #1E293B;
  --border-strong:  #334155;
  --text-primary:   #F8FAFC;
  --text-secondary: #94A3B8;
  --text-tertiary:  #64748B;
  --text-inverse:   #0F172A;
  --primary:        #6366F1;
  --primary-hover:  #818CF8;
  --primary-fg:     #FFFFFF;
  --primary-tint:   #1E1B4B;
  --ring:           rgba(129,140,248,.40);
  --success: #22C55E; --success-tint: #052E16; --success-fg: #86EFAC;
  --warning: #F59E0B; --warning-tint: #451A03; --warning-fg: #FCD34D;
  --danger:  #EF4444; --danger-tint:  #450A0A; --danger-fg:  #FCA5A5;
  --info:    #3B82F6; --info-tint:    #172554; --info-fg:    #93C5FD;
  --cell-dirty-bg:     #1E1B4B;
  --cell-dirty-border: #6366F1;
  --row-hover:         #1E1B4B;
  --cell-empty:        #1E293B;
  --cell-empty-hover:  #334155;
}
```

---

## 3. Типографика

- **UI-шрифт:** Inter (`'Inter', system-ui, -apple-system, 'Segoe UI', sans-serif`).
- **Моно (ключи, токены, код):** JetBrains Mono (`'JetBrains Mono', ui-monospace, Menlo, monospace`).
- Подключение: self-host через `@fontsource/inter` и `@fontsource/jetbrains-mono`
  (предпочтительно для офлайна/скорости) или Google Fonts.

| Токен | Размер / высота / вес | Применение |
|-------|------------------------|------------|
| `text-2xl` | 24 / 1.25 / 600 | заголовок страницы |
| `text-xl` | 20 / 1.3 / 600 | заголовок секции |
| `text-lg` | 18 / 1.4 / 500 | подзаголовок |
| `text-md` | 16 / 1.5 / 400 | крупный body |
| `text-base` | 14 / 1.5 / 400 | **базовый UI / таблица** |
| `text-sm` | 13 / 1.45 / 400 | вторичный текст |
| `text-xs` | 12 / 1.4 / 500 | лейблы, бейджи, заголовки колонок |
| `mono-sm` | 12.5 / 1.4 / 400 | ключи `[copy]`, токены |

Веса: 400 / 500 / 600. Регистр — sentence case, без ALL CAPS.

**Display-заголовки (лендинг/вход/онбординг — «входные» экраны):** крупнее рабочего
интерфейса. Hero-заголовок лендинга — `text-4xl`→`text-5xl` (36→48px), подзаголовок 18px,
кнопки размера `xl`. Заголовки экранов входа/онбординга — `text-2xl`. В рабочей области
(таблица/настройки) остаётся компактная шкала из таблицы выше. Хедер лендинга — в
контейнере `max-w-5xl` (контент не у краёв).

---

## 4. Размеры, радиусы, тени

```css
:root {
  --space-1:4px; --space-2:8px; --space-3:12px; --space-4:16px;
  --space-5:20px; --space-6:24px; --space-8:32px; --space-10:40px;
  --radius-sm:6px; --radius-md:8px; --radius-lg:12px; --radius-full:9999px;
  --shadow-sm: 0 1px 2px rgba(15,23,42,.06);
  --shadow-md: 0 4px 12px rgba(15,23,42,.08);
  --shadow-pop: 0 8px 24px rgba(15,23,42,.12); /* для меню/поповеров */
}
```

- Границы: `1px solid var(--border)` (или `--border-strong` для акцента/hover).
- Радиус по умолчанию `--radius-md`; карточки/модалы — `--radius-lg`.
- Тени — минимально: только поповеры/меню/модалы и focus-ring. Таблица — плоская.
- Focus-ring: `box-shadow: 0 0 0 3px var(--ring)` на интерактиве.

---

## 5. Компоненты (библиотека `shared/ui`)

> **Единая библиотека UI-компонентов.** Все стилизованные элементы живут в `src/shared/ui`
> и импортируются через баррель `@/shared/ui`. На каждом экране переиспользуем их, а не
> верстаем заново. Новый переиспользуемый элемент → добавь в `shared/ui` и в баррель.
>
> Уже реализовано: `Button` + `buttonStyles`, `Badge` (tone/pill), `Logo`.
> По мере шагов добавляются: `Input`, `Select`, `Modal`, `Toast`, `Tabs`, `Table`-обёртка,
> `EmptyState`, `Skeleton`.


**Button** — размеры sm 28 / md 36 / lg 40 / xl 48px, радиус md, вес 500.
- `primary`: bg `--primary`, текст `--primary-fg`, hover `--primary-hover`.
- `secondary`: bg `--bg-surface`, border `--border`, текст `--text-primary`, hover bg `--bg-hover`.
- `ghost`: прозрачный, hover bg `--bg-hover`.
- `danger`: bg `--danger`, текст белый.
- disabled: opacity .5, cursor not-allowed (так выглядят заглушки — поиск/фильтр).

**Input / Select** — высота 36px, border `--border`, радиус md, focus-ring. Плейсхолдер `--text-tertiary`.

**Badge / StatusPill** — `--radius-sm`, 12px/500, заливка `*-tint`, текст `*-fg`. Статусы перевода — таблица в §1.

**Tabs (namespaces)** — активная: bg `--primary`, текст белый; неактивная: bg `--bg-surface`, border `--border`, текст `--text-secondary`.

**Modal** — карточка `--bg-surface`, радиус lg, `--shadow-pop`, оверлей `rgba(2,6,23,.45)`.

**Toast** — по семантике (success/danger/...), tint-фон + соответствующий текст + иконка.

**Sidebar** — ширина 240px, bg `--bg-surface`, border-right. Активный пункт: bg `--primary-tint`, текст `--primary-hover`, вес 500.

**Table** (см. также `08-table-design`):
- высота строки 40px, заголовок sticky. Закреплена (sticky) **только** колонка `code`;
  `comment` прокручивается вместе с языками.
- hover строки: bg `--row-hover` (лёгкий индиго). Граница ячеек: `--border`.
- пустая ячейка (нет перевода): bg `--cell-empty` + плейсхолдер «—» (`--text-tertiary`);
  на hover — `--cell-empty-hover` (на тон темнее), чтобы пустые не сливались с hover-строкой.
  Статусы ревью (draft/reviewed) отложены — на Шагах 3–4 различаем только «пусто vs заполнено».
- тип раздела (strings/plurals) — бейдж `tone="primary"` рядом с заголовком экрана.
- dirty-ячейка (Шаг 4): bg `--cell-dirty-bg`, `box-shadow: inset 0 0 0 1.5px var(--cell-dirty-border)`.

Иконки: один набор (Tabler / Lucide), размеры 16–20px, цвет наследуется.

---

## 6. Tailwind-конфиг (готово к вставке)

```js
// tailwind.config.js — theme.extend
export default {
  darkMode: ['class', '[data-theme="dark"]'],
  theme: { extend: {
    colors: {
      primary: { DEFAULT:'#4F46E5', hover:'#4338CA', tint:'#EEF2FF',
                 50:'#EEF2FF',100:'#E0E7FF',200:'#C7D2FE',300:'#A5B4FC',
                 400:'#818CF8',500:'#6366F1',600:'#4F46E5',700:'#4338CA',
                 800:'#3730A3',900:'#312E81' },
      slate: { 50:'#F8FAFC',100:'#F1F5F9',200:'#E2E8F0',300:'#CBD5E1',
               400:'#94A3B8',500:'#64748B',600:'#475569',700:'#334155',
               800:'#1E293B',900:'#0F172A',950:'#020617' },
      // семантические — через CSS-переменные, чтобы переключались с темой:
      surface:'var(--bg-surface)', page:'var(--bg-page)', subtle:'var(--bg-subtle)',
      border:'var(--border)',
      ink:'var(--text-primary)', muted:'var(--text-secondary)', faint:'var(--text-tertiary)',
    },
    fontFamily: {
      sans: ['Inter','system-ui','-apple-system','Segoe UI','sans-serif'],
      mono: ['JetBrains Mono','ui-monospace','Menlo','monospace'],
    },
    borderRadius: { sm:'6px', md:'8px', lg:'12px' },
    boxShadow: {
      sm:'0 1px 2px rgba(15,23,42,.06)', md:'0 4px 12px rgba(15,23,42,.08)',
      pop:'0 8px 24px rgba(15,23,42,.12)',
    },
  }},
};
```

Подход: палитра (indigo/slate) — статичными значениями для утилит вроде `bg-primary-50`;
а то, что меняется между темами (поверхности, текст, границы), — через **CSS-переменные**,
объявленные в §2. Так одна разметка работает в обеих темах без дублей классов.

---

## 7. Как использовать (правило для агента)

1. Перед версткой любого экрана открой этот файл и `13-design-and-ux.md`.
2. Цвета/отступы/радиусы — **только** токены отсюда (CSS-переменные/Tailwind), не сырые hex в компонентах.
3. Проверяй обе темы: мысленный тест — читаемо ли всё на тёмном фоне.
4. Новый паттерн? Сначала собери из существующих токенов/компонентов; если нужен новый
   токен — добавь его сюда (в §2/§4), не плодя разовые значения.
5. Состояния обязательны: hover / focus (ring) / disabled (заглушки) / loading / empty / error.
