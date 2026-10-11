'use server';

import { isIP } from 'node:net';

import { headers } from 'next/headers';

import { postPublic } from '@/lib/api/public-api';

import { contactSchema } from './schemas';

import type { ContactField, ContactFormState } from './schemas';

const CONTACT_FIELDS: ContactField[] = ['name', 'email', 'subject', 'message'];
const RATE_LIMITED_MESSAGE = 'You have sent several messages recently. Try again in an hour, or use the email address on this page.';
const FAILED_MESSAGE = 'Your message could not be sent. Try again in a moment, or use the email address on this page.';

function text(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === 'string' ? value : '';
}

// The visitor's address for the backend's per-visitor limit. Next.js fills X-Forwarded-For from the connection when
// the request brings none, so until a trusted proxy overwrites it the value can be spoofed (see notes).
async function visitorIp(): Promise<string | null> {
  const first = (await headers()).get('x-forwarded-for')?.split(',')[0]?.trim() ?? '';
  return isIP(first) === 0 ? null : first;
}

// The contact form's Server Action: checked here, then sent to the backend, which checks again and stores it.
export async function sendContactMessage(_previous: ContactFormState, formData: FormData): Promise<ContactFormState> {
  const values = {
    name: text(formData, 'name'),
    email: text(formData, 'email'),
    subject: text(formData, 'subject'),
    message: text(formData, 'message'),
  };
  const input = contactSchema.safeParse({ ...values, website: text(formData, 'website') });

  if (!input.success) {
    const fieldErrors: ContactFormState['fieldErrors'] = {};
    for (const issue of input.error.issues) {
      const field = issue.path[0];
      if (typeof field === 'string' && CONTACT_FIELDS.includes(field as ContactField)) {
        fieldErrors[field as ContactField] ??= issue.message;
      }
    }
    return { status: 'failed', values, fieldErrors };
  }

  const ip = await visitorIp();
  const { subject, website, ...required } = input.data;
  const result = await postPublic(
    '/messages',
    { ...required, subject: subject === '' ? undefined : subject, website: website === '' ? undefined : website },
    ip === null ? {} : { 'X-Forwarded-For': ip },
  );

  if (result.status === 201) {
    return {
      status: 'sent',
      values: { name: '', email: '', subject: '', message: '' },
      fieldErrors: {},
      senderName: input.data.name.split(/\s+/)[0],
    };
  }
  if (result.status === 422 && Object.keys(result.fieldErrors).length > 0) {
    const fieldErrors = Object.fromEntries(
      Object.entries(result.fieldErrors).filter(([field]) => CONTACT_FIELDS.includes(field as ContactField)),
    );
    return { status: 'failed', values, fieldErrors, formError: Object.keys(fieldErrors).length === 0 ? FAILED_MESSAGE : undefined };
  }
  return { status: 'failed', values, fieldErrors: {}, formError: result.status === 429 ? RATE_LIMITED_MESSAGE : FAILED_MESSAGE };
}
