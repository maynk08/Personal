import { beforeEach, describe, expect, it, vi } from 'vitest';

import { sendContactMessage } from '@/features/contact/actions';
import { INITIAL_CONTACT_STATE } from '@/features/contact/form-state';
import { postPublic } from '@/lib/api/public-api';

vi.mock('@/lib/api/public-api', () => ({ postPublic: vi.fn() }));
vi.mock('next/headers', () => ({ headers: () => Promise.resolve(new Headers({ 'x-forwarded-for': '203.0.113.7, 10.0.0.1' })) }));

const postMock = vi.mocked(postPublic);

function form(fields: Record<string, string>): FormData {
  const data = new FormData();
  for (const [name, value] of Object.entries({ name: '', email: '', subject: '', message: '', website: '', ...fields })) {
    data.set(name, value);
  }
  return data;
}

const valid = { name: 'Grace Hopper', email: 'grace@example.com', message: 'Hello!' };

beforeEach(() => {
  postMock.mockReset();
});

describe('sendContactMessage', () => {
  it('checks the fields first and keeps what was typed', async () => {
    const state = await sendContactMessage(INITIAL_CONTACT_STATE, form({ email: 'nope', message: 'Hi' }));

    expect(state).toMatchObject({
      status: 'failed',
      fieldErrors: { name: 'Enter your name', email: 'Enter a valid email address, like name@example.com' },
      values: { email: 'nope', message: 'Hi' },
    });
    expect(postMock).not.toHaveBeenCalled();
  });

  it('sends the message with the visitor’s address and thanks them by first name', async () => {
    postMock.mockResolvedValue({ status: 201, fieldErrors: {} });

    const state = await sendContactMessage(INITIAL_CONTACT_STATE, form(valid));

    expect(state).toMatchObject({ status: 'sent', senderName: 'Grace' });
    expect(postMock).toHaveBeenCalledWith(
      '/messages',
      { name: 'Grace Hopper', email: 'grace@example.com', message: 'Hello!' },
      { 'X-Forwarded-For': '203.0.113.7' },
    );
  });

  it('passes the honeypot on, so the backend can drop the message quietly', async () => {
    postMock.mockResolvedValue({ status: 201, fieldErrors: {} });

    await sendContactMessage(INITIAL_CONTACT_STATE, form({ ...valid, website: 'https://spam.example.com' }));

    expect(postMock.mock.lastCall?.[1]).toMatchObject({ website: 'https://spam.example.com' });
  });

  it.each([
    ['too many messages', 429, /sent several messages recently/],
    ['an unexpected answer', 500, /could not be sent/],
    ['an unreachable backend', 0, /could not be sent/],
  ])('explains %s and keeps the text', async (_case, status, message) => {
    postMock.mockResolvedValue({ status, fieldErrors: {} });

    const state = await sendContactMessage(INITIAL_CONTACT_STATE, form(valid));

    expect(state.formError).toMatch(message);
    expect(state.values.message).toBe('Hello!');
  });

  it('puts the backend’s field errors next to the fields', async () => {
    postMock.mockResolvedValue({ status: 422, fieldErrors: { email: 'Enter a valid email address' } });

    expect(await sendContactMessage(INITIAL_CONTACT_STATE, form(valid))).toMatchObject({
      fieldErrors: { email: 'Enter a valid email address' },
    });
  });
});
