import Image from 'next/image';

import { MediaImage } from '@/components/content/media-image';

import type { PublicImage } from '@/lib/api/public-schemas';

const GALLERY_SIZES = '(min-width: 768px) 768px, 100vw';

// One screenshot at its own shape when its size is known; otherwise in a 16:9 box.
function GalleryImage({ image, fallbackAlt }: { image: PublicImage; fallbackAlt: string }) {
  if (image.width !== null && image.height !== null) {
    return (
      <Image
        src={image.url}
        alt={image.altText ?? fallbackAlt}
        width={image.width}
        height={image.height}
        sizes={GALLERY_SIZES}
        className="h-auto w-full rounded-lg border border-border"
      />
    );
  }
  return (
    <MediaImage
      image={image}
      fallbackAlt={fallbackAlt}
      sizes={GALLERY_SIZES}
      className="aspect-video w-full rounded-lg border border-border"
    />
  );
}

// Screenshots stacked at full width, each captioned with its alt text when the admin wrote one.
export function ProjectGallery({ title, images }: { title: string; images: PublicImage[] }) {
  if (images.length === 0) {
    return null;
  }
  return (
    <section aria-labelledby="gallery-heading" className="flex flex-col gap-6">
      <h2 id="gallery-heading" className="text-2xl font-medium tracking-tight">
        Screenshots
      </h2>
      <ul className="flex flex-col gap-8">
        {images.map((image, index) => (
          <li key={`${index}-${image.url}`}>
            <figure className="flex flex-col gap-2">
              <GalleryImage image={image} fallbackAlt={`${title} screenshot ${index + 1}`} />
              {image.altText !== null && <figcaption className="text-sm text-muted">{image.altText}</figcaption>}
            </figure>
          </li>
        ))}
      </ul>
    </section>
  );
}
