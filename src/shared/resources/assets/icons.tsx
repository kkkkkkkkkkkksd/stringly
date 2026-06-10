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
