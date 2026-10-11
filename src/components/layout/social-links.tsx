import { PLATFORM_NAMES, SocialIcon } from '@/components/layout/social-icon';

import type { SocialLink } from '@/lib/api/public-schemas';

// The admin's social links, in their order, as icon buttons with a visible-on-focus name.
export function SocialLinks({ links }: { links: SocialLink[] }) {
  if (links.length === 0) {
    return null;
  }
  return (
    <ul aria-label="Social links" className="flex flex-wrap items-center gap-1">
      {links.map((link) => {
        const name = link.label ?? PLATFORM_NAMES[link.platform];
        const isEmail = link.platform === 'email';
        return (
          <li key={`${link.platform}-${link.url}`}>
            <a
              href={link.url}
              {...(isEmail ? {} : { target: '_blank', rel: 'noopener noreferrer me' })}
              title={name}
              className="inline-flex size-10 items-center justify-center rounded-md text-muted transition-colors hover:text-accent"
            >
              <SocialIcon platform={link.platform} />
              {/* The name is hidden text rather than aria-label, so it is never checked against the icon's visible "in". */}
              <span className="sr-only">
                {isEmail ? (link.label === null ? 'Send an email' : `Email: ${link.label}`) : `${name} (opens in a new tab)`}
              </span>
            </a>
          </li>
        );
      })}
    </ul>
  );
}
