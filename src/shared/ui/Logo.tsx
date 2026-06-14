import type { ReactNode } from 'react';
import { brand } from '@/shared/config/brand';
import { BrandMarkIcon } from '@/shared/resources/assets';

// Логотип бренда: знак (из assets) + вордмарк Inter Extrabold (жирный, выразительный).
// Размер вордмарка привязан к size, чтобы знак и текст были сбалансированы.
export function Logo({
  size = 18,
  withText = true,
  tone = 'default',
}: {
  size?: number;
  withText?: boolean;
  tone?: 'default' | 'inverse';
}): ReactNode {
  return (
    <span className={`flex items-center gap-2 ${tone === 'inverse' ? 'text-white' : 'text-ink'}`}>
      <BrandMarkIcon size={size} />
      {withText && (
        <span className="font-extrabold" style={{ fontSize: size, letterSpacing: '-0.02em' }}>
          {brand.name}
        </span>
      )}
    </span>
  );
}
