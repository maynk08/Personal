'use client';

import { CheckIcon, CopyIcon } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import { cn } from '@/lib/utils/cn';

import type { ComponentPropsWithoutRef } from 'react';

const COPIED_MESSAGE_MS = 2000;

type CodeBlockProps = ComponentPropsWithoutRef<'pre'> & { 'data-language'?: string };

// A highlighted code block with its language and a copy button above it. "text" blocks get no language label.
export function CodeBlock({ 'data-language': language, className, children, ...props }: CodeBlockProps) {
  const preRef = useRef<HTMLPreElement>(null);
  const [hasCopied, setHasCopied] = useState(false);

  useEffect(() => {
    if (!hasCopied) {
      return undefined;
    }
    const timer = setTimeout(() => {
      setHasCopied(false);
    }, COPIED_MESSAGE_MS);
    return () => {
      clearTimeout(timer);
    };
  }, [hasCopied]);

  const copy = async (): Promise<void> => {
    const text = preRef.current?.textContent ?? '';
    try {
      await navigator.clipboard.writeText(text);
      setHasCopied(true);
    } catch {
      // The browser refused clipboard access; the code can still be selected by hand.
    }
  };

  return (
    <div className="not-prose my-6 overflow-hidden rounded-lg border border-border bg-surface">
      <div className="flex items-center justify-between border-b border-border px-3 py-1.5 font-mono text-xs text-muted">
        <span>{language === undefined || language === 'text' ? '' : language}</span>
        <button
          type="button"
          onClick={() => {
            void copy();
          }}
          className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 hover:text-foreground"
        >
          {hasCopied ? (
            <CheckIcon aria-hidden="true" className="size-3.5 text-accent" />
          ) : (
            <CopyIcon aria-hidden="true" className="size-3.5" />
          )}
          {hasCopied ? 'Copied' : 'Copy'}
          <span className="sr-only"> code</span>
        </button>
        <span role="status" className="sr-only">
          {hasCopied ? 'Code copied' : ''}
        </span>
      </div>
      <pre ref={preRef} className={cn('overflow-x-auto p-4 font-mono text-sm leading-relaxed', className)} {...props}>
        {children}
      </pre>
    </div>
  );
}
