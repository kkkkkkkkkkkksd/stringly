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

// Шеврон вниз (стрелка селекта/раскрытия).
export const ChevronDownIcon = (p: IconProps): ReactNode => (
  <Svg {...p}>
    <path d="m6 9 6 6 6-6" {...line} />
  </Svg>
);

// Галочка (успех).
export const CheckIcon = (p: IconProps): ReactNode => (
  <Svg {...p}>
    <path d="m5 13 4 4L19 7" {...line} />
  </Svg>
);

// Предупреждение (ошибка/опасность) — треугольник с «!».
export const AlertIcon = (p: IconProps): ReactNode => (
  <Svg {...p}>
    <path d="M10.3 4.3 2.4 18a2 2 0 0 0 1.7 3h15.8a2 2 0 0 0 1.7-3L13.7 4.3a2 2 0 0 0-3.4 0Z" {...line} />
    <path d="M12 9v4M12 17h.01" {...line} />
  </Svg>
);

// Информация — «i» в круге.
export const InfoIcon = (p: IconProps): ReactNode => (
  <Svg {...p}>
    <circle cx={12} cy={12} r={9} stroke="currentColor" strokeWidth={1.8} />
    <path d="M12 11v5M12 8h.01" {...line} />
  </Svg>
);

// Глаз (показать пароль).
export const EyeIcon = (p: IconProps): ReactNode => (
  <Svg {...p}>
    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" {...line} />
    <circle cx={12} cy={12} r={3} stroke="currentColor" strokeWidth={1.8} />
  </Svg>
);

// Перечёркнутый глаз (скрыть пароль).
export const EyeOffIcon = (p: IconProps): ReactNode => (
  <Svg {...p}>
    <path d="M3 3l18 18" {...line} />
    <path d="M10.6 5.2A9.7 9.7 0 0 1 12 5c6.5 0 10 7 10 7a17 17 0 0 1-3.3 4.1M6.1 6.1A17 17 0 0 0 2 12s3.5 7 10 7a9.7 9.7 0 0 0 4-.85" {...line} />
    <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" {...line} />
  </Svg>
);

// Искра / AI (авто-перевод).
export const SparkleIcon = (p: IconProps): ReactNode => (
  <Svg {...p}>
    <path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9L12 3Z" {...line} />
    <path d="M19 14l.8 2.2L22 17l-2.2.8L19 20l-.8-2.2L16 17l2.2-.8L19 14Z" {...line} />
  </Svg>
);

// Выход (logout).
export const LogoutIcon = (p: IconProps): ReactNode => (
  <Svg {...p}>
    <path d="M9 4H5a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h4M16 17l5-5-5-5M21 12H9" {...line} />
  </Svg>
);

// Участники (люди).
export const UsersIcon = (p: IconProps): ReactNode => (
  <Svg {...p}>
    <path d="M16 19v-1a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v1" {...line} />
    <circle cx={9} cy={7} r={3.2} stroke="currentColor" strokeWidth={1.8} />
    <path d="M22 19v-1a4 4 0 0 0-3-3.85M16 4.15A4 4 0 0 1 16 11.7" {...line} />
  </Svg>
);

// История (часы со стрелкой).
export const HistoryIcon = (p: IconProps): ReactNode => (
  <Svg {...p}>
    <path d="M3 12a9 9 0 1 0 3-6.7L3 8" {...line} />
    <path d="M3 4v4h4M12 8v4l3 2" {...line} />
  </Svg>
);

// Документ.
export const DocIcon = (p: IconProps): ReactNode => (
  <Svg {...p}>
    <path d="M7 3h7l5 5v13H7zM14 3v5h5M10 13h6M10 17h6" {...line} />
  </Svg>
);

// Помощь (вопрос в круге).
export const HelpIcon = (p: IconProps): ReactNode => (
  <Svg {...p}>
    <circle cx={12} cy={12} r={9} stroke="currentColor" strokeWidth={1.8} />
    <path d="M9.5 9a2.5 2.5 0 0 1 4.5 1.5c0 1.7-2 2-2 3.5M12 17h.01" {...line} />
  </Svg>
);

// Стрелка вправо (далее / переход).
export const ChevronRightIcon = (p: IconProps): ReactNode => (
  <Svg {...p}>
    <path d="m9 6 6 6-6 6" {...line} />
  </Svg>
);

// Шестерёнка (настройки/управление). Канонический путь Lucide «settings» (24×24).
export const SettingsIcon = (p: IconProps): ReactNode => (
  <Svg {...p}>
    <path
      d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"
      {...line}
    />
    <circle cx={12} cy={12} r={3} stroke="currentColor" strokeWidth={1.8} />
  </Svg>
);
