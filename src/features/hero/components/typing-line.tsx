'use client';

import { useEffect, useState } from 'react';

import { usePrefersReducedMotion } from '@/hooks/use-prefers-reduced-motion';

const TYPE_DELAY_MS = 60;
const DELETE_DELAY_MS = 30;
const HOLD_MS = 1800;
const BEFORE_NEXT_MS = 400;

type TypingState = { phraseIndex: number; length: number; isDeleting: boolean };

/**
 * The hero's "> building …" line. It starts with the first phrase already written (that is what the server renders),
 * then deletes it and types the next one, in a loop. Screen readers get every phrase once as plain text instead.
 */
export function TypingLine({ phrases }: { phrases: string[] }) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const first = phrases[0] ?? '';
  const [state, setState] = useState<TypingState>({ phraseIndex: 0, length: first.length, isDeleting: false });
  const isAnimated = !prefersReducedMotion && phrases.length > 1;
  const phrase = isAnimated ? (phrases[state.phraseIndex] ?? '') : first;
  const shown = isAnimated ? phrase.slice(0, state.length) : first;

  useEffect(() => {
    if (!isAnimated) {
      return undefined;
    }
    const isComplete = !state.isDeleting && state.length === phrase.length;
    const isEmpty = state.isDeleting && state.length === 0;
    const delay = isComplete ? HOLD_MS : isEmpty ? BEFORE_NEXT_MS : state.isDeleting ? DELETE_DELAY_MS : TYPE_DELAY_MS;

    const timer = setTimeout(() => {
      setState((current) => {
        if (!current.isDeleting && current.length === phrase.length) {
          return { ...current, isDeleting: true };
        }
        if (current.isDeleting && current.length === 0) {
          return { phraseIndex: (current.phraseIndex + 1) % phrases.length, length: 0, isDeleting: false };
        }
        return { ...current, length: current.length + (current.isDeleting ? -1 : 1) };
      });
    }, delay);
    return () => {
      clearTimeout(timer);
    };
  }, [isAnimated, phrase.length, phrases.length, state]);

  if (first === '') {
    return null;
  }

  return (
    <>
      <p aria-hidden="true" className="min-h-lh font-mono text-base text-foreground sm:text-lg">
        <span className="text-accent">&gt;</span> {shown}
        <span className="typing-caret" />
      </p>
      <p className="sr-only">{phrases.join('. ')}</p>
    </>
  );
}
