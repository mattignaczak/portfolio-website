import { useActionState } from 'react';

interface ContactState {
  status: 'idle' | 'success' | 'error';
  message: string;
}

function readField(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === 'string' ? value.trim() : '';
}

async function submitContact(_prev: ContactState, formData: FormData): Promise<ContactState> {
  const name = readField(formData, 'name');
  const email = readField(formData, 'email');
  const message = readField(formData, 'message');

  if (!name || !email || !message) {
    return { status: 'error', message: 'All fields are required.' };
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { status: 'error', message: 'Please enter a valid email address.' };
  }

  await new Promise((r) => setTimeout(r, 600));
  return { status: 'success', message: `Thanks ${name} — message received.` };
}

export function Contact() {
  const [state, action, isPending] = useActionState<ContactState, FormData>(submitContact, {
    status: 'idle',
    message: '',
  });

  return (
    <form action={action} className="contact-form">
      <p>Drop me a line — I'll get back to you.</p>
      <div className="field-row-stacked">
        <label htmlFor="contact-name">Name</label>
        <input id="contact-name" name="name" type="text" required />
      </div>
      <div className="field-row-stacked">
        <label htmlFor="contact-email">Email</label>
        <input id="contact-email" name="email" type="email" required />
      </div>
      <div className="field-row-stacked">
        <label htmlFor="contact-message">Message</label>
        <textarea id="contact-message" name="message" rows={5} required />
      </div>
      <div className="form-actions">
        <button type="submit" disabled={isPending}>
          {isPending ? 'Sending…' : 'Send'}
        </button>
        {state.status !== 'idle' && (
          <p className={`status status-${state.status}`} role="status">
            {state.message}
          </p>
        )}
      </div>
    </form>
  );
}
