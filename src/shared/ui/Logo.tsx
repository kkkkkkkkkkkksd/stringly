import type { ReactNode } from 'react';
import { brand } from '@/shared/config/brand';
import { BrandMarkIcon } from '@/shared/resources/assets';

// Логотип бренда: знак (из assets) + название. Переиспользуется в хедере и сайдбаре.
export function Logo({ size = 18, withText = true }: { size?: number; withText?: boolean }): ReactNode {
  return (
    <span className="flex items-center gap-2 font-mono font-medium text-ink">
      <BrandMarkIcon size={size} />
      {withText && brand.name}
    </span>
  );
}
