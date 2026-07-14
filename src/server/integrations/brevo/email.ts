/**
 * Brevo transactional email (DA-8). Text-only on purpose: the messages are
 * operational (notification/acknowledgement), text renders everywhere, and
 * there is no brand manual yet (H10) to design HTML against.
 */
import type { BrevoClient } from '@/server/integrations/brevo/client';

export interface OutgoingEmail {
  from: string;
  to: string;
  subject: string;
  text: string;
}

export async function sendEmail(
  client: BrevoClient,
  email: OutgoingEmail,
): Promise<void> {
  await client.post('/smtp/email', {
    sender: { email: email.from },
    to: [{ email: email.to }],
    subject: email.subject,
    textContent: email.text,
  });
}
