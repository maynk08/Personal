import { z } from 'zod';

export const CONTACT_LIMITS = { name: 100, subject: 200, message: 5000 } as const;

// The same rules as the backend, which checks them again.
export const contactSchema = z.object({
  name: z.string().trim().min(1, 'Enter your name').max(CONTACT_LIMITS.name, `Use at most ${CONTACT_LIMITS.name} characters`),
  email: z.string().trim().min(1, 'Enter your email address').pipe(z.email('Enter a valid email address, like name@example.com')),
  subject: z.string().trim().max(CONTACT_LIMITS.subject, `Use at most ${CONTACT_LIMITS.subject} characters`),
  message: z
    .string()
    .trim()
    .min(1, 'Write a message')
    .max(CONTACT_LIMITS.message, `Use at most ${CONTACT_LIMITS.message.toLocaleString('en')} characters`),
  // The honeypot: hidden from people, so only bots fill it in. The backend quietly drops those messages.
  website: z.string().max(2048),
});

export type ContactField = 'name' | 'email' | 'subject' | 'message';

export interface ContactFormState {
  status: 'idle' | 'sent' | 'failed';
  // What was typed, so a failed attempt keeps it.
  values: Record<ContactField, string>;
  fieldErrors: Partial<Record<ContactField, string>>;
  formError?: string;
  // First name of the sender, for the thank-you note.
  senderName?: string;
}

export const INITIAL_CONTACT_STATE: ContactFormState = {
  status: 'idle',
  values: { name: '', email: '', subject: '', message: '' },
  fieldErrors: {},
};
