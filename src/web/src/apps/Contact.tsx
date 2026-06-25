import { useActionState } from 'react';
import { PaperPlaneRight } from '@phosphor-icons/react';
import { content, format } from '../content';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

const { contact } = content;

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
  if (!fields.name || !fields.email || !fields.message) {
    return contact.status.allRequired;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email)) {
    return contact.status.invalidEmail;
  }
  if (fields.message.length < 10) {
    return contact.status.shortMessage;
  }
  return null;
}

async function submitContact(_prev: ContactState, formData: FormData): Promise<ContactState> {
  const fields = readFields(formData);
  const error = validate(fields);
  if (error) {
    return { status: 'error', message: error };
  }

  await new Promise((r) => setTimeout(r, 600));
  return { status: 'success', message: format(contact.status.success, { name: fields.name }) };
}

export function Contact() {
  const [state, action, isPending] = useActionState<ContactState, FormData>(submitContact, {
    status: 'idle',
    message: '',
  });

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="font-heading text-3xl">{contact.heading}</h1>
        <p className="text-sm">{contact.intro}</p>
      </div>

      <Card className="bg-secondary-background">
        <CardContent>
          <form action={action} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="contact-name">{contact.fields.name}</Label>
              <Input id="contact-name" name="name" type="text" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact-email">{contact.fields.email}</Label>
              <Input id="contact-email" name="email" type="email" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact-message">{contact.fields.message}</Label>
              <Textarea id="contact-message" name="message" rows={5} required />
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <Button type="submit" disabled={isPending}>
                <PaperPlaneRight weight="bold" />
                {isPending ? contact.sending : contact.submit}
              </Button>
              {state.status !== 'idle' && (
                <p
                  role="status"
                  className={cn(
                    'rounded-base border-2 border-border px-3 py-1 text-sm font-base shadow-shadow',
                    state.status === 'success'
                      ? 'bg-main text-main-foreground'
                      : 'bg-chart-2 text-main-foreground',
                  )}
                >
                  {state.message}
                </p>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
