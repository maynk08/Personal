import Image from 'next/image';

import { cn } from '@/lib/utils/cn';

import type { PublicImage } from '@/lib/api/public-schemas';

type MediaImageProps = {
  image: PublicImage;
  // Used when the admin left the alt text empty, e.g. "Acme logo".
  fallbackAlt: string;
  // How wide the image is shown, for choosing a size: "(min-width: 768px) 320px, 100vw".
  sizes: string;
  className?: string;
  // For the image itself, e.g. a hover zoom inside the box.
  imageClassName?: string;
  priority?: boolean;
};

// An uploaded image in a box sized by its parent (object-cover), so missing dimensions never shift the layout.
export function MediaImage({ image, fallbackAlt, sizes, className, imageClassName, priority = false }: MediaImageProps) {
  return (
    <div className={cn('relative overflow-hidden', className)}>
      <Image
        src={image.url}
        alt={image.altText ?? fallbackAlt}
        fill
        sizes={sizes}
        // The page's main image: fetched early and first, never lazily.
        preload={priority}
        loading={priority ? 'eager' : 'lazy'}
        fetchPriority={priority ? 'high' : 'auto'}
        className={cn('object-cover', imageClassName)}
      />
    </div>
  );
}
