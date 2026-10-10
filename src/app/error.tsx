'use client';

// Shown when a page's content could not be loaded; nothing is guessed in its place.
export default function PageError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div role="alert" className="flex flex-col items-start gap-4 py-24">
      <h1 className="text-3xl font-medium tracking-tight">This site is temporarily unavailable</h1>
      <p className="text-muted">Try again in a moment.</p>
      <button type="button" onClick={reset} className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-on-accent">
        Try again
      </button>
    </div>
  );
}
