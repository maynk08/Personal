import 'server-only';

import { cache } from 'react';

import { getPublic } from '@/lib/api/public-api';
import { siteSchema } from '@/lib/api/public-schemas';

import type { Site } from '@/lib/api/public-schemas';

// Name, theme, navigation, social links and résumé for every page; cached per request so the layout and the page
// share one call.
export const getSite = cache((): Promise<Site> => getPublic('/site', siteSchema));
