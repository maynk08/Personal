import '@/styles/globals.css';

import { Geist, JetBrains_Mono } from 'next/font/google';

import { SiteFooter } from '@/components/layout/site-footer';
import { SiteHeader } from '@/components/layout/site-header';
import { env } from '@/config/env';
import { getSite } from '@/features/site/queries';
import { cn } from '@/lib/utils/cn';

import type { Metadata } from 'next';

const geist = Geist({ subsets: ['latin'], variable: '--font-geist' });
const jetBrainsMono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-jetbrains-mono' });

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSite();
  const name = site.name === '' ? 'Portfolio' : site.name;
  return {
    metadataBase: new URL(env.siteUrl),
    title: { default: name, template: `%s · ${name}` },
  };
}

// The theme comes from the CMS and is set on the server, so the page never flashes the other theme.
export default async function RootLayout({ children }: LayoutProps<'/'>) {
  const site = await getSite();

  return (
    <html lang="en" data-theme={site.theme} className={cn(geist.variable, jetBrainsMono.variable)}>
      <body id="top" className="flex min-h-svh flex-col">
        <a
          href="#content"
          className="sr-only z-50 rounded-md bg-accent px-3 py-2 font-mono text-sm text-on-accent focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
        >
          Skip to content
        </a>
        <SiteHeader site={site} />
        <main id="content" className="mx-auto w-full max-w-6xl flex-1 px-4 sm:px-6">
          {children}
        </main>
        <SiteFooter site={site} />
      </body>
    </html>
  );
}
