import { GlobeIcon, LinkIcon, MailIcon } from 'lucide-react';
import { siDevdotto, siGithub, siInstagram, siLeetcode, siMedium, siStackoverflow, siX, siYoutube } from 'simple-icons';

import type { SocialPlatform } from '@/lib/api/public-schemas';
import type { SimpleIcon } from 'simple-icons';

const BRAND_ICONS: Partial<Record<SocialPlatform, SimpleIcon>> = {
  github: siGithub,
  x: siX,
  instagram: siInstagram,
  youtube: siYoutube,
  medium: siMedium,
  devto: siDevdotto,
  stackoverflow: siStackoverflow,
  leetcode: siLeetcode,
};

export const PLATFORM_NAMES: Record<SocialPlatform, string> = {
  github: 'GitHub',
  linkedin: 'LinkedIn',
  x: 'X',
  instagram: 'Instagram',
  youtube: 'YouTube',
  medium: 'Medium',
  devto: 'DEV',
  stackoverflow: 'Stack Overflow',
  leetcode: 'LeetCode',
  website: 'Website',
  email: 'Email',
  other: 'Link',
};

// Decorative: the link around it carries the accessible name.
export function SocialIcon({ platform, className = 'size-5' }: { platform: SocialPlatform; className?: string }) {
  const brand = BRAND_ICONS[platform];
  if (brand !== undefined) {
    return (
      <svg role="img" aria-hidden="true" viewBox="0 0 24 24" className={className} fill="currentColor">
        <path d={brand.path} />
      </svg>
    );
  }
  if (platform === 'linkedin') {
    // Simple Icons no longer ships the LinkedIn logo, so it is shown as a text mark.
    return (
      <span
        aria-hidden="true"
        className={`inline-flex items-center justify-center font-mono text-[0.95em] leading-none font-medium ${className}`}
      >
        in
      </span>
    );
  }
  if (platform === 'email') {
    return <MailIcon aria-hidden="true" className={className} />;
  }
  return platform === 'website' ? (
    <GlobeIcon aria-hidden="true" className={className} />
  ) : (
    <LinkIcon aria-hidden="true" className={className} />
  );
}
