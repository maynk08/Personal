import 'server-only';

import * as simpleIcons from 'simple-icons';

import type { SimpleIcon } from 'simple-icons';

// Every Simple Icons logo by slug ("nodedotjs"). Built on the server only, so the icon set never reaches the browser.
const ICONS_BY_SLUG = new Map(
  Object.values(simpleIcons)
    .filter((value): value is SimpleIcon => typeof value === 'object' && 'slug' in value && 'path' in value)
    .map((icon) => [icon.slug, icon.path]),
);

// A monochrome logo in the text colour; nothing for an unknown slug (the skill name is always shown).
export function SkillLogo({ slug }: { slug: string | null }) {
  const path = slug === null ? undefined : ICONS_BY_SLUG.get(slug);
  if (path === undefined) {
    return null;
  }
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="size-3.5 shrink-0" fill="currentColor">
      <path d={path} />
    </svg>
  );
}
