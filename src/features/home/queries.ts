import 'server-only';

import { cache } from 'react';

import { getPublic } from '@/lib/api/public-api';
import { homeSchema } from '@/lib/api/public-schemas';

import type { Home } from '@/lib/api/public-schemas';

// Everything on the home page in one call: the profile and the visible sections in order, with their items.
export const getHome = cache((): Promise<Home> => getPublic('/home', homeSchema));
