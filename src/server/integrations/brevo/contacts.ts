/**
 * Brevo CRM contact delivery (ADR-008, DA-2). Contacts are upserted
 * (updateEnabled) so a repeated capture from the same email refreshes the
 * record instead of failing — Brevo returns 400 "duplicate" otherwise, which
 * the retry policy would classify as permanent.
 *
 * Attribute names follow Brevo's uppercase convention. Only lead data goes
 * here — candidatures never reach the CRM (Bible §21, separate purpose).
 */
import type { BrevoClient } from '@/server/integrations/brevo/client';

export interface CrmContact {
  email: string;
  nombre?: string;
  empresa?: string;
  servicio?: string;
  recurso?: string;
  /** Capture origin: 'contacto' form or 'lead_magnet' download. */
  origen: string;
}

export async function upsertContact(
  client: BrevoClient,
  contact: CrmContact,
): Promise<void> {
  const attributes: Record<string, string> = { ORIGEN: contact.origen };
  if (contact.nombre) attributes['NOMBRE'] = contact.nombre;
  if (contact.empresa) attributes['EMPRESA'] = contact.empresa;
  if (contact.servicio) attributes['SERVICIO'] = contact.servicio;
  if (contact.recurso) attributes['RECURSO'] = contact.recurso;

  await client.post('/contacts', {
    email: contact.email,
    attributes,
    updateEnabled: true,
  });
}
