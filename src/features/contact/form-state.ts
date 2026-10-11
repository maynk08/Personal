// What the contact form needs in the browser. Kept apart from the validation schema so Zod stays on the server.

export const CONTACT_LIMITS = { name: 100, subject: 200, message: 5000 } as const;

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
