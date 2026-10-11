'use client';

import { SendIcon } from 'lucide-react';
import { useActionState, useEffect, useRef } from 'react';

import { sendContactMessage } from '@/features/contact/actions';
import { CONTACT_LIMITS, INITIAL_CONTACT_STATE } from '@/features/contact/schemas';
import { cn } from '@/lib/utils/cn';

import type { ContactField, ContactFormState } from '@/features/contact/schemas';

const FIELD_ORDER: ContactField[] = ['name', 'email', 'subject', 'message'];

const inputClass =
  'w-full rounded-md border border-border bg-surface px-3 py-2 text-foreground placeholder:text-muted/70 focus:border-accent focus:outline-none aria-invalid:border-danger';

type FieldProps = {
  name: ContactField;
  label: string;
  state: ContactFormState;
  isOptional?: boolean;
  children: (props: { id: string; 'aria-invalid': boolean; 'aria-describedby'?: string; defaultValue: string }) => React.ReactNode;
};

function Field({ name, label, state, isOptional = false, children }: FieldProps) {
  const id = `contact-${name}`;
  const error = state.fieldErrors[name];
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium">
        {label}
        {isOptional && <span className="font-normal text-muted"> (optional)</span>}
      </label>
      {children({
        id,
        'aria-invalid': error !== undefined,
        'aria-describedby': error === undefined ? undefined : `${id}-error`,
        defaultValue: state.values[name],
      })}
      {error !== undefined && (
        <p id={`${id}-error`} className="text-sm text-danger">
          {error}
        </p>
      )}
    </div>
  );
}

// Works before JavaScript loads (a plain form post); once loaded it keeps the page and shows errors in place.
export function ContactForm() {
  const [state, submit, isPending] = useActionState(sendContactMessage, INITIAL_CONTACT_STATE);
  const formRef = useRef<HTMLFormElement>(null);
  const statusRef = useRef<HTMLParagraphElement>(null);

  // After a failed send, focus the first field with an error; after success, the thank-you note.
  useEffect(() => {
    if (state.status === 'sent') {
      statusRef.current?.focus();
      return;
    }
    const firstError = FIELD_ORDER.find((field) => state.fieldErrors[field] !== undefined);
    if (firstError !== undefined) {
      formRef.current?.querySelector<HTMLElement>(`#contact-${firstError}`)?.focus();
    }
  }, [state]);

  if (state.status === 'sent') {
    return (
      <p ref={statusRef} role="status" tabIndex={-1} className="rounded-xl border border-accent/40 bg-accent/10 p-5 outline-none">
        Thanks{state.senderName === undefined ? '' : `, ${state.senderName}`}! Your message is on its way, and I will reply by email.
      </p>
    );
  }

  return (
    <form ref={formRef} action={submit} className="flex flex-col gap-4">
      {state.formError !== undefined && (
        <p role="alert" className="rounded-md border border-danger/40 bg-danger/10 px-3 py-2 text-sm">
          {state.formError}
        </p>
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        <Field name="name" label="Name" state={state}>
          {(props) => <input {...props} name="name" autoComplete="name" required maxLength={CONTACT_LIMITS.name} className={inputClass} />}
        </Field>
        <Field name="email" label="Email" state={state}>
          {(props) => <input {...props} name="email" type="email" autoComplete="email" required className={inputClass} />}
        </Field>
      </div>
      <Field name="subject" label="Subject" state={state} isOptional>
        {(props) => <input {...props} name="subject" maxLength={CONTACT_LIMITS.subject} className={inputClass} />}
      </Field>
      <Field name="message" label="Message" state={state}>
        {(props) => (
          <textarea {...props} name="message" rows={6} required maxLength={CONTACT_LIMITS.message} className={cn(inputClass, 'resize-y')} />
        )}
      </Field>
      {/* The honeypot: off-screen and skipped by keyboard and autofill, so only bots fill it in. */}
      <div aria-hidden="true" className="honeypot">
        <label htmlFor="contact-website">Website</label>
        <input id="contact-website" name="website" type="text" tabIndex={-1} autoComplete="off" defaultValue="" />
      </div>
      <button
        type="submit"
        disabled={isPending}
        className="inline-flex w-fit items-center gap-2 rounded-md bg-accent px-4 py-2 text-sm font-medium text-on-accent disabled:opacity-70"
      >
        <SendIcon aria-hidden="true" className="size-4" />
        {isPending ? 'Sending…' : 'Send message'}
      </button>
    </form>
  );
}
