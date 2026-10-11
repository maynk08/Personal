import 'server-only';

import { unstable_rethrow } from 'next/navigation';
import { z } from 'zod';

import { env } from '@/config/env';

const PUBLIC_API_PREFIX = '/api/public';
const REQUEST_TIMEOUT_MS = 10_000;

// A failed call to the backend; pages turn it into the "temporarily unavailable" page, never into guessed content.
export class PublicApiError extends Error {
  readonly status: number | null;

  constructor(message: string, status: number | null, options?: { cause?: unknown }) {
    super(message, options);
    this.name = new.target.name;
    this.status = status;
  }
}

// The requested item does not exist or is hidden; pages show the not-found page.
export class PublicApiNotFoundError extends PublicApiError {}

const envelopeSchema = z.object({ success: z.literal(true), data: z.unknown() });

/**
 * Reads from the backend's public API. Never cached (content is always fresh), with a timeout, and every response is
 * checked against its schema before a page uses it.
 */
export async function getPublic<T>(path: string, schema: z.ZodType<T>): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${env.backendUrl}${PUBLIC_API_PREFIX}${path}`, {
      headers: { Accept: 'application/json', 'X-Request-Id': crypto.randomUUID() },
      cache: 'no-store',
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
  } catch (error) {
    // Next.js signals "render this page per request" by throwing from fetch during the build; let that through.
    unstable_rethrow(error);
    throw new PublicApiError(`The backend could not be reached for ${path}`, null, { cause: error });
  }

  if (response.status === 404) {
    throw new PublicApiNotFoundError(`Not found: ${path}`, 404);
  }
  if (!response.ok) {
    throw new PublicApiError(`The backend answered ${response.status} for ${path}`, response.status);
  }

  let body: unknown;
  try {
    body = await response.json();
  } catch (error) {
    throw new PublicApiError(`The backend sent something other than JSON for ${path}`, response.status, { cause: error });
  }
  const envelope = envelopeSchema.safeParse(body);
  const data = envelope.success ? schema.safeParse(envelope.data.data) : null;
  if (data?.success !== true) {
    throw new PublicApiError(`Unexpected response from ${path}`, response.status, { cause: data?.error ?? envelope.error });
  }
  return data.data;
}

export interface PublicPostResult {
  status: number;
  // The backend's field errors for a 422, keyed by field.
  fieldErrors: Record<string, string>;
}

// Sends data to the public API (the contact form). Returns the status instead of throwing, so the form can explain it.
export async function postPublic(path: string, body: unknown, headers: Record<string, string> = {}): Promise<PublicPostResult> {
  let response: Response;
  try {
    response = await fetch(`${env.backendUrl}${PUBLIC_API_PREFIX}${path}`, {
      method: 'POST',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json', 'X-Request-Id': crypto.randomUUID(), ...headers },
      body: JSON.stringify(body),
      cache: 'no-store',
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
  } catch (error) {
    unstable_rethrow(error);
    return { status: 0, fieldErrors: {} };
  }
  const fieldErrors: Record<string, string> = {};
  if (response.status === 422) {
    const errors = z
      .object({ errors: z.array(z.object({ field: z.string(), message: z.string() })) })
      .safeParse(await response.json().catch(() => null));
    for (const { field, message } of errors.success ? errors.data.errors : []) {
      fieldErrors[field] ??= message;
    }
  }
  return { status: response.status, fieldErrors };
}
