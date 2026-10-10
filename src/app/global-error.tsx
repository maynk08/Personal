'use client';

import '@/styles/globals.css';

// Replaces the whole page when even the layout (name, theme, navigation) could not be loaded. Uses the dark theme.
export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en" data-theme="dark">
      <body className="flex min-h-svh items-center justify-center px-4">
        <div role="alert" className="flex max-w-md flex-col items-start gap-4">
          <h1 className="text-3xl font-medium tracking-tight">This site is temporarily unavailable</h1>
          <p className="text-muted">Try again in a moment.</p>
          <button type="button" onClick={reset} className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-on-accent">
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
