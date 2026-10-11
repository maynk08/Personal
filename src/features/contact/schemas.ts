import { z } from 'zod';

import { CONTACT_LIMITS } from '@/features/contact/form-state';

// The same rules as the backend, which checks them again. Server only: the form imports `form-state` instead.
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
