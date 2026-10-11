'use client';

import { LazyMotion, useInView } from 'motion/react';
import * as m from 'motion/react-m';
import { useEffect, useRef, useState } from 'react';

import { usePrefersReducedMotion } from '@/hooks/use-prefers-reduced-motion';

import type { ReactNode } from 'react';

const RISE_PX = 16;
const DURATION_S = 0.4;
const STAGGER_S = 0.06;
// Items after this many share the last delay, so long lists never keep people waiting.
const MAX_STAGGER_STEPS = 5;

// Loaded on demand; nothing needs it before content starts to reveal.
const loadFeatures = () => import('@/components/motion/motion-features').then((module) => module.domAnimation);

type RevealProps = {
  children: ReactNode;
  // Position in a list, for a short stagger between items that appear together.
  index?: number;
  as?: 'div' | 'li';
  className?: string;
};

/**
 * Fades and lifts its content in when it scrolls into view. The page arrives fully visible: only content that is
 * below the screen once the page is running is hidden first, so nothing flickers, and without JavaScript or with
 * reduced motion nothing moves at all.
 */
export function Reveal({ children, index = 0, as = 'div', className }: RevealProps) {
  const ref = useRef<HTMLDivElement & HTMLLIElement>(null);
  const prefersReducedMotion = usePrefersReducedMotion();
  // Set once motion is known to be welcome and the content starts below the screen; content already on screen (or
  // above it) is never hidden.
  const [startsBelowFold, setStartsBelowFold] = useState(false);
  // Stays true after the first time, so revealed content never hides again.
  const isInView = useInView(ref, { once: true, margin: '0px 0px -10% 0px' });

  // Measuring the page is a read from the browser, which only an effect can do.
  useEffect(() => {
    const element = ref.current;
    if (!prefersReducedMotion && element !== null && element.getBoundingClientRect().top > window.innerHeight) {
      setStartsBelowFold(true);
    }
  }, [prefersReducedMotion]);

  const Element = as === 'li' ? m.li : m.div;
  return (
    <LazyMotion features={loadFeatures} strict>
      <Element
        ref={ref}
        className={className}
        initial={false}
        animate={startsBelowFold && !isInView ? 'hidden' : 'visible'}
        variants={{
          hidden: { opacity: 0, y: RISE_PX, transition: { duration: 0 } },
          visible: {
            opacity: 1,
            y: 0,
            transition: { duration: DURATION_S, ease: 'easeOut', delay: Math.min(index, MAX_STAGGER_STEPS) * STAGGER_S },
          },
        }}
      >
        {children}
      </Element>
    </LazyMotion>
  );
}
