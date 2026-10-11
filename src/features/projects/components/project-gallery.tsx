import Image from 'next/image';

import { MediaImage } from '@/components/content/media-image';
import { Reveal } from '@/components/motion/reveal';

import type { PublicImage } from '@/lib/api/public-schemas';

const GALLERY_SIZES = '(min-width: 768px) 768px, 100vw';

// One screenshot at its own shape when its size is known; otherwise in a 16:9 box.
function GalleryImage({ image, alt }: { image: PublicImage; alt: string }) {
  if (image.width !== null && image.height !== null) {
    return (
      <Image
        src={image.url}
        alt={alt}
        width={image.width}
        height={image.height}
        sizes={GALLERY_SIZES}
        className="h-auto w-full rounded-lg border border-border"
      />
    );
  }
  return (
    <MediaImage
      image={{ ...image, altText: alt }}
      fallbackAlt={alt}
      sizes={GALLERY_SIZES}
      className="aspect-video w-full rounded-lg border border-border"
    />
  );
}

// Screenshots stacked at full width. Alt text the admin wrote becomes the visible caption, and the image itself then
// gets an empty alt so screen readers do not hear the same words twice; otherwise it is named "<title> screenshot N".
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
          <Reveal as="li" key={`${index}-${image.url}`}>
            <figure className="flex flex-col gap-2">
              <GalleryImage image={image} alt={image.altText === null ? `${title} screenshot ${index + 1}` : ''} />
              {image.altText !== null && <figcaption className="text-sm text-muted">{image.altText}</figcaption>}
            </figure>
          </Reveal>
        ))}
      </ul>
    </section>
  );
}
