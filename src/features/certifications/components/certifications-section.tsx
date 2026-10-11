import { ExternalLinkIcon } from 'lucide-react';

import { MediaImage } from '@/components/content/media-image';
import { PageSection } from '@/components/layout/page-section';
import { currentYearMonth, formatYearMonth } from '@/lib/utils/format-date';

import type { Section } from '@/lib/api/public-schemas';

type CertificationsSectionProps = {
  index: number;
  section: Extract<Section, { key: 'certifications' }>;
};

// Expired certificates stay listed, marked as expired (the expiry month is before this month).
export function CertificationsSection({ index, section }: CertificationsSectionProps) {
  const today = currentYearMonth();
  return (
    <PageSection id="certifications" index={index} label="certifications" heading={section.heading}>
      <ul className="grid gap-4 md:grid-cols-2">
        {section.items.map((certificate) => {
          const isExpired = certificate.expiryDate !== null && certificate.expiryDate < today;
          return (
            <li key={certificate.id} className="flex gap-4 rounded-xl border border-border bg-surface p-4">
              {certificate.badge !== null && (
                <MediaImage
                  image={certificate.badge}
                  fallbackAlt={`${certificate.name} badge`}
                  sizes="56px"
                  className="size-14 shrink-0 rounded-md"
                />
              )}
              <div className="flex min-w-0 flex-col gap-1">
                <h3 className="font-medium">{certificate.name}</h3>
                <p className="text-sm text-muted">{certificate.issuer}</p>
                <p className="font-mono text-xs text-muted">
                  Issued {formatYearMonth(certificate.issueDate)}
                  {certificate.expiryDate !== null &&
                    (isExpired ? (
                      <span> · Expired {formatYearMonth(certificate.expiryDate)}</span>
                    ) : (
                      <span> · Expires {formatYearMonth(certificate.expiryDate)}</span>
                    ))}
                </p>
                {certificate.credentialUrl !== null && (
                  <a
                    href={certificate.credentialUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 inline-flex w-fit items-center gap-1 font-mono text-xs text-accent underline-offset-4 hover:underline"
                  >
                    View credential
                    <ExternalLinkIcon aria-hidden="true" className="size-3" />
                    <span className="sr-only"> for {certificate.name} (opens in a new tab)</span>
                  </a>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </PageSection>
  );
}
