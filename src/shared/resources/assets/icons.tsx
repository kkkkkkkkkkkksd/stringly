import type { ReactNode, SVGProps } from 'react';

// ASSETS: иконки как именованные SVG-компоненты (человекочитаемые имена вместо «сырых»
// path-строк в JSX). Цвет наследуется (currentColor), размер задаётся пропом size.
// Сюда же добавляются новые иконки и изображения.
type IconProps = { size?: number } & Omit<SVGProps<SVGSVGElement>, 'width' | 'height'>;

function Svg({ size = 18, children, ...rest }: IconProps & { children: ReactNode }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true" {...rest}>
      {children}
    </svg>
  );
}

const line = {
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
} as const;

// Знак бренда Stringly (три строки разной длины).
export const BrandMarkIcon = (p: IconProps): ReactNode => (
  <Svg {...p}>
    <path d="M4 6h16M4 12h10M4 18h7" stroke="currentColor" strokeWidth={2} strokeLinecap="round" />
  </Svg>
);

// Таблица / строки.
export const TableRowsIcon = (p: IconProps): ReactNode => (
  <Svg {...p}>
    <path d="M4 6h16M4 12h16M4 18h16" {...line} />
  </Svg>
);

// Доступ по API (стрелки кода).
export const ApiIcon = (p: IconProps): ReactNode => (
  <Svg {...p}>
    <path d="M7 8l-4 4 4 4M17 8l4 4-4 4M14 4l-4 16" {...line} />
  </Svg>
);

// Языки.
export const LanguageIcon = (p: IconProps): ReactNode => (
  <Svg {...p}>
    <path d="M5 8h14M9 4v4m1.5 0c0 5-3 9-6 11M8 14c2 2 5 3 8 3M14 20l3.5-8 3.5 8m-6-2h5" {...line} />
  </Svg>
);

// Плюс (добавить).
export const PlusIcon = (p: IconProps): ReactNode => (
  <Svg {...p}>
    <path d="M12 5v14M5 12h14" {...line} />
  </Svg>
);

// Поиск.
export const SearchIcon = (p: IconProps): ReactNode => (
  <Svg {...p}>
    <circle cx={11} cy={11} r={7} stroke="currentColor" strokeWidth={1.8} />
    <path d="m20 20-3.5-3.5" {...line} />
  </Svg>
);

// Фильтр.
export const FilterIcon = (p: IconProps): ReactNode => (
  <Svg {...p}>
    <path d="M4 5h16l-6 8v5l-4 2v-7L4 5Z" {...line} />
  </Svg>
);

// Сохранить (дискета).
export const SaveIcon = (p: IconProps): ReactNode => (
  <Svg {...p}>
    <path d="M5 4h11l3 3v13H5V4Z" {...line} />
    <path d="M8 4v5h7M8 14h8v6H8z" {...line} />
  </Svg>
);

// Ключ.
export const KeyIcon = (p: IconProps): ReactNode => (
  <Svg {...p}>
    <circle cx={8} cy={15} r={4} stroke="currentColor" strokeWidth={1.8} />
    <path d="m11 12 9-9m-3 0 3 3m-6 0 2 2" {...line} />
  </Svg>
);

// Пустое состояние (входящие / стопка).
export const InboxIcon = (p: IconProps): ReactNode => (
  <Svg {...p}>
    <path d="M4 13 6 5h12l2 8v6H4v-6Z" {...line} />
    <path d="M4 13h5l1 2h4l1-2h5" {...line} />
  </Svg>
);

// Закрыть.
export const CloseIcon = (p: IconProps): ReactNode => (
  <Svg {...p}>
    <path d="M6 6l12 12M18 6 6 18" {...line} />
  </Svg>
);

// Удалить (корзина).
export const TrashIcon = (p: IconProps): ReactNode => (
  <Svg {...p}>
    <path d="M4 7h16M9 7V5h6v2M6 7l1 13h10l1-13M10 11v6M14 11v6" {...line} />
  </Svg>
);

// Меню действий (три точки по вертикали).
export const DotsVerticalIcon = (p: IconProps): ReactNode => (
  <Svg {...p}>
    <circle cx={12} cy={5} r={1.6} fill="currentColor" />
    <circle cx={12} cy={12} r={1.6} fill="currentColor" />
    <circle cx={12} cy={19} r={1.6} fill="currentColor" />
  </Svg>
);
