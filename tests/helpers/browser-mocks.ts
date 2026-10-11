import { act } from '@testing-library/react';
import { vi } from 'vitest';

// jsdom has neither IntersectionObserver nor matchMedia; these stand-ins let tests decide what the browser reports.

type Observed = { element: Element; callback: IntersectionObserverCallback; observer: IntersectionObserver };

const observed: Observed[] = [];

export class MockIntersectionObserver {
  readonly root = null;
  readonly rootMargin = '';
  readonly thresholds = [0];

  constructor(private readonly callback: IntersectionObserverCallback) {}

  observe(element: Element): void {
    observed.push({ element, callback: this.callback, observer: this });
  }

  unobserve(element: Element): void {
    const index = observed.findIndex((entry) => entry.element === element && entry.callback === this.callback);
    if (index !== -1) {
      observed.splice(index, 1);
    }
  }

  disconnect(): void {
    for (let index = observed.length - 1; index >= 0; index -= 1) {
      if (observed[index]?.callback === this.callback) {
        observed.splice(index, 1);
      }
    }
  }

  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }
}

// Tells every observer watching `element` that it scrolled into view.
export function scrollIntoView(element: Element): void {
  act(() => {
    for (const entry of observed.filter((item) => item.element === element)) {
      entry.callback([{ isIntersecting: true, target: element, intersectionRatio: 1 } as IntersectionObserverEntry], entry.observer);
    }
  });
}

export function setReducedMotion(isReduced: boolean): void {
  window.matchMedia = vi.fn((query: string) => ({
    matches: isReduced && query.includes('reduce'),
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(() => false),
  }));
}

export function installBrowserMocks(): void {
  observed.length = 0;
  vi.stubGlobal('IntersectionObserver', MockIntersectionObserver);
  setReducedMotion(false);
}
