'use client';

import { MenuIcon, XIcon } from 'lucide-react';
import { useEffect, useId, useRef, useState } from 'react';

import { NavLinks } from '@/components/layout/nav-links';

import type { NavItem } from '@/components/layout/nav-links';

// On phones the section links sit in a panel below the header. It closes on choosing a link or pressing Escape;
// the panel follows the button in the page order, so Tab moves straight into it.
export function MobileMenu({ items }: { items: NavItem[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelId = useId();

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }
    const closeOnEscape = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        setIsOpen(false);
        buttonRef.current?.focus();
      }
    };
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [isOpen]);

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="md:hidden">
      <button
        ref={buttonRef}
        type="button"
        aria-expanded={isOpen}
        aria-controls={panelId}
        onClick={() => {
          setIsOpen((open) => !open);
        }}
        className="inline-flex items-center gap-2 rounded-md px-2.5 py-1.5 font-mono text-sm text-muted hover:text-foreground"
      >
        {isOpen ? <XIcon aria-hidden="true" className="size-4" /> : <MenuIcon aria-hidden="true" className="size-4" />}
        Menu
      </button>
      <nav
        id={panelId}
        aria-label="Sections"
        hidden={!isOpen}
        className="absolute inset-x-0 top-full border-b border-border bg-background px-4 py-3"
      >
        <NavLinks
          items={items}
          orientation="vertical"
          onNavigate={() => {
            setIsOpen(false);
          }}
        />
      </nav>
    </div>
  );
}
