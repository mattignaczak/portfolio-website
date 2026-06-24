import { useActionState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

interface ContactState {
  status: 'idle' | 'success' | 'error';
  message: string;
}

interface ContactFields {
  name: string;
  email: string;
  message: string;
}

function readFields(formData: FormData): ContactFields {
  const read = (key: string) => {
    const value = formData.get(key);
    return typeof value === 'string' ? value.trim() : '';
  };
  return { name: read('name'), email: read('email'), message: read('message') };
}

function validate(fields: ContactFields): string | null {
  // TODO(human): decide the validation rules for the contact form.
  // Return an error message (string) if the input is invalid, or null if it's OK.
  // `fields` has trimmed { name, email, message }.
  return null;
}

async function submitContact(_prev: ContactState, formData: FormData): Promise<ContactState> {
  const fields = readFields(formData);
  const error = validate(fields);
  if (error) {
    return { status: 'error', message: error };
  }

  await new Promise((r) => setTimeout(r, 600));
  return { status: 'success', message: `Thanks ${fields.name} — message received.` };
}

export function Contact() {
  const [state, action, isPending] = useActionState<ContactState, FormData>(submitContact, {
    status: 'idle',
    message: '',
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Contact</h1>
      <p className="text-sm text-muted-foreground">Drop me a line — I&apos;ll get back to you.</p>

      <form action={action} className="max-w-md space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="contact-name">Name</Label>
          <Input id="contact-name" name="name" type="text" required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="contact-email">Email</Label>
          <Input id="contact-email" name="email" type="email" required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="contact-message">Message</Label>
          <Textarea id="contact-message" name="message" rows={5} required />
        </div>
        <div className="flex items-center gap-3">
          <Button type="submit" disabled={isPending}>
            {isPending ? 'Sending…' : 'Send'}
          </Button>
          {state.status !== 'idle' && (
            <p
              role="status"
              className={cn(
                'text-sm',
                state.status === 'success' ? 'text-foreground' : 'text-destructive',
              )}
            >
              {state.message}
            </p>
          )}
        </div>
      </form>
    </div>
  );
}
