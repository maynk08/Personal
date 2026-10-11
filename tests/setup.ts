import '@testing-library/jest-dom/vitest';

import { cleanup } from '@testing-library/react';
import { afterEach, beforeEach } from 'vitest';

import { installBrowserMocks } from './helpers/browser-mocks';

beforeEach(() => {
  if (typeof window !== 'undefined') {
    installBrowserMocks();
  }
});

afterEach(() => {
  cleanup();
});
