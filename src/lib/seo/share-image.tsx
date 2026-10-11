import 'server-only';

import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

import { ImageResponse } from 'next/og';

import type { Site } from '@/lib/api/public-schemas';

export const SHARE_IMAGE_SIZE = { width: 1200, height: 630 };

const PHOTO_TIMEOUT_MS = 5000;
// The image renderer reads PNG and JPEG; any other photo format is left out instead of failing the whole image.
const PHOTO_TYPES = new Set(['image/png', 'image/jpeg']);
const TITLE_MAX_LENGTH = 70;
const DESCRIPTION_MAX_LENGTH = 150;
const MAX_TAGS = 5;

// The P1 tokens; the image follows the site's theme like the pages do.
const PALETTES = {
  dark: { background: '#0B0D10', border: '#1F242C', foreground: '#E6E8EB', muted: '#8B93A1', accent: '#3DDC97', decor: '#4A5361' },
  light: { background: '#FAFAF7', border: '#E4E4DE', foreground: '#16181D', muted: '#5F6670', accent: '#0F7A55', decor: '#C9CCC4' },
} as const;

const fontFile = (...path: string[]): Promise<Buffer> => readFile(join(process.cwd(), 'node_modules', ...path));

type ShareFont = { name: string; data: Buffer; weight: 400 | 500; style: 'normal' };

// Read once per server process; the same typefaces the pages use, from the font packages.
let fontsPromise: Promise<ShareFont[]> | null = null;

function loadFonts(): Promise<ShareFont[]> {
  fontsPromise ??= Promise.all([
    fontFile('geist', 'dist', 'fonts', 'geist-sans', 'Geist-Regular.ttf'),
    fontFile('geist', 'dist', 'fonts', 'geist-sans', 'Geist-Medium.ttf'),
    fontFile('@fontsource', 'jetbrains-mono', 'files', 'jetbrains-mono-latin-400-normal.woff'),
  ]).then(([regular, medium, mono]): ShareFont[] => [
    { name: 'Geist', data: regular, weight: 400, style: 'normal' },
    { name: 'Geist', data: medium, weight: 500, style: 'normal' },
    { name: 'JetBrains Mono', data: mono, weight: 400, style: 'normal' },
  ]);
  return fontsPromise;
}

function shorten(text: string, maxLength: number): string {
  return text.length <= maxLength ? text : `${text.slice(0, maxLength - 1).trimEnd()}…`;
}

// The photo as a data URL, or null when it cannot be used; a slow or broken image never blocks the share image.
async function loadPhoto(url: string): Promise<string | null> {
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(PHOTO_TIMEOUT_MS) });
    const type = response.headers.get('content-type')?.split(';')[0]?.trim() ?? '';
    if (!response.ok || !PHOTO_TYPES.has(type)) {
      return null;
    }
    return `data:${type};base64,${Buffer.from(await response.arrayBuffer()).toString('base64')}`;
  } catch {
    return null;
  }
}

type ShareImageInput = {
  theme: Site['theme'];
  // The path-style label at the top: "~/projects/portfolio-cms".
  label: string;
  title: string;
  description: string | null;
  // Bottom line, usually the site owner's name.
  footer: string;
  tags?: string[];
  photoUrl?: string | null;
};

// The picture shown when a page is shared: a path label, a large title, a short description and the owner's name.
export async function renderShareImage({ theme, label, title, description, footer, tags = [], photoUrl = null }: ShareImageInput) {
  const colors = PALETTES[theme];
  const [fonts, photo] = await Promise.all([loadFonts(), photoUrl === null ? null : loadPhoto(photoUrl)]);

  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: 72,
        backgroundColor: colors.background,
        backgroundImage: `radial-gradient(circle, ${colors.decor} 1px, transparent 1px)`,
        backgroundSize: '22px 22px',
        color: colors.foreground,
        fontFamily: 'Geist',
      }}
    >
      <div style={{ display: 'flex', fontFamily: 'JetBrains Mono', fontSize: 28, color: colors.accent }}>{label}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 56 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, flex: 1 }}>
          <div style={{ display: 'flex', fontSize: 76, fontWeight: 500, letterSpacing: -2, lineHeight: 1.05 }}>
            {shorten(title, TITLE_MAX_LENGTH)}
          </div>
          {description !== null && description !== '' && (
            <div style={{ display: 'flex', fontSize: 34, color: colors.muted, lineHeight: 1.3 }}>
              {shorten(description, DESCRIPTION_MAX_LENGTH)}
            </div>
          )}
        </div>
        {photo !== null && (
          // eslint-disable-next-line @next/next/no-img-element -- the share image renderer only understands <img>.
          <img
            src={photo}
            alt=""
            width={220}
            height={220}
            style={{ borderRadius: 9999, border: `4px solid ${colors.border}`, objectFit: 'cover' }}
          />
        )}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, fontFamily: 'JetBrains Mono', fontSize: 26, color: colors.muted }}>
          <div style={{ width: 14, height: 14, borderRadius: 9999, backgroundColor: colors.accent }} />
          {footer}
        </div>
        {tags.length > 0 && (
          <div style={{ display: 'flex', gap: 10 }}>
            {tags.slice(0, MAX_TAGS).map((tag) => (
              <div
                key={tag}
                style={{
                  display: 'flex',
                  padding: '6px 14px',
                  border: `2px solid ${colors.border}`,
                  borderRadius: 8,
                  fontFamily: 'JetBrains Mono',
                  fontSize: 22,
                  color: colors.muted,
                }}
              >
                {tag}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>,
    { ...SHARE_IMAGE_SIZE, fonts },
  );
}
