import { beforeEach, describe, expect, it, vi } from 'vitest';
import { z } from 'zod';

import { getProject } from '@/features/projects/queries';
import { PublicApiError, PublicApiNotFoundError, getPublic } from '@/lib/api/public-api';
import { toPathLabel } from '@/lib/utils/path-label';

const { NotFoundSignal } = vi.hoisted(() => ({ NotFoundSignal: class NotFoundSignal extends Error {} }));

vi.mock('next/navigation', () => ({
  notFound: () => {
    throw new NotFoundSignal();
  },
  unstable_rethrow: vi.fn(),
}));

const fetchMock = vi.fn<typeof fetch>();
vi.stubGlobal('fetch', fetchMock);

const schema = z.object({ name: z.string() });

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
}

beforeEach(() => {
  fetchMock.mockReset();
});

describe('getPublic', () => {
  it('reads fresh data from the public API and checks it', async () => {
    fetchMock.mockResolvedValue(jsonResponse(200, { success: true, data: { name: 'Ada', extra: 1 } }));

    expect(await getPublic('/site', schema)).toEqual({ name: 'Ada' });
    const [url, init] = fetchMock.mock.lastCall ?? [];
    expect(url).toBe('http://backend.test/api/public/site');
    expect(init).toMatchObject({ cache: 'no-store' });
    expect(init?.signal).toBeInstanceOf(AbortSignal);
  });

  it('reports a missing item separately, so pages can show "not found"', async () => {
    fetchMock.mockResolvedValue(jsonResponse(404, { success: false, message: 'Project not found' }));

    await expect(getPublic('/projects/nope', schema)).rejects.toBeInstanceOf(PublicApiNotFoundError);
  });

  it.each([
    ['the backend fails', () => fetchMock.mockResolvedValue(jsonResponse(500, { success: false, message: 'Internal' }))],
    ['the backend is down', () => fetchMock.mockRejectedValue(new TypeError('fetch failed'))],
    ['the data has the wrong shape', () => fetchMock.mockResolvedValue(jsonResponse(200, { success: true, data: { name: 42 } }))],
    ['the answer is not JSON', () => fetchMock.mockResolvedValue(new Response('<html>', { status: 200 }))],
  ])('throws a site error when %s, instead of guessing content', async (_case, arrange) => {
    arrange();

    const error: unknown = await getPublic('/site', schema).catch((rejection: unknown) => rejection);

    expect(error).toBeInstanceOf(PublicApiError);
    expect(error).not.toBeInstanceOf(PublicApiNotFoundError);
  });
});

describe('getProject', () => {
  it('shows the not-found page for an unknown or hidden project', async () => {
    fetchMock.mockResolvedValue(jsonResponse(404, { success: false, message: 'Project not found' }));

    await expect(getProject('hidden-project')).rejects.toBeInstanceOf(NotFoundSignal);
  });

  it('keeps an odd slug inside its path segment', async () => {
    fetchMock.mockResolvedValue(jsonResponse(404, { success: false, message: 'Project not found' }));

    await getProject('../site').catch(() => undefined);

    expect(fetchMock.mock.lastCall?.[0]).toBe('http://backend.test/api/public/projects/..%2Fsite');
  });
});

describe('toPathLabel', () => {
  it('turns headings into path-like labels', () => {
    expect(toPathLabel('About')).toBe('~/about');
    expect(toPathLabel('About me')).toBe('~/about-me');
    expect(toPathLabel('Café & Projects!')).toBe('~/cafe-projects');
  });
});
