// @vitest-environment jsdom
import { render, screen, waitFor } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { Reveal } from '@/components/motion/reveal';

import { scrollIntoView, setReducedMotion } from '../helpers/browser-mocks';

// Where elements sit on the page; jsdom does no layout, so the test says whether they start below the screen.
function placeElements(top: number): void {
  vi.spyOn(Element.prototype, 'getBoundingClientRect').mockReturnValue({ top, bottom: top + 100 } as DOMRect);
}

const isHidden = (element: HTMLElement): boolean => element.style.opacity === '0';

afterEach(() => {
  vi.restoreAllMocks();
});

describe('Reveal', () => {
  it('arrives visible from the server, so nothing waits for JavaScript', () => {
    const html = renderToString(
      <Reveal>
        <p>Server text</p>
      </Reveal>,
    );

    expect(html).toContain('Server text');
    expect(html).not.toMatch(/opacity:\s*0/);
    expect(html).not.toContain('translate');
  });

  it('leaves content that is already on screen alone', () => {
    placeElements(100);
    render(
      <Reveal>
        <p>On screen</p>
      </Reveal>,
    );

    expect(isHidden(screen.getByText('On screen').parentElement as HTMLElement)).toBe(false);
  });

  it('hides content below the screen until it scrolls into view, then reveals it', async () => {
    placeElements(window.innerHeight + 500);
    render(
      <Reveal as="li" index={2}>
        <p>Further down</p>
      </Reveal>,
    );
    const wrapper = screen.getByText('Further down').parentElement as HTMLElement;
    expect(wrapper.tagName).toBe('LI');
    await waitFor(() => {
      expect(isHidden(wrapper)).toBe(true);
    });

    scrollIntoView(wrapper);

    await waitFor(() => {
      expect(wrapper.style.opacity).toBe('1');
    });
    expect(screen.getByText('Further down')).toBeInTheDocument();
  });

  it('never hides or moves anything for visitors who reduce motion', async () => {
    setReducedMotion(true);
    placeElements(window.innerHeight + 500);
    render(
      <Reveal>
        <p>Still</p>
      </Reveal>,
    );
    const wrapper = screen.getByText('Still').parentElement as HTMLElement;

    // Give a would-be hide a chance to happen.
    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(isHidden(wrapper)).toBe(false);
    expect(wrapper.style.transform).not.toMatch(/translate/);
  });
});
