import { vi } from 'vitest';

export const navigationState = { pathname: '/' };

// next/navigation with only the hook the components use replaced.
export function createNavigationModule(actual: object): object {
  return {
    ...actual,
    usePathname: () => navigationState.pathname,
    useRouter: () => ({ push: vi.fn(), replace: vi.fn(), refresh: vi.fn() }),
  };
}
