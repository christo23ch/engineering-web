/**
 * Transactional email templates (DA-8) — Spanish (ADR-009), text-only,
 * PROVISIONAL copy (content honesty, Bible §1/§3): neutral wording, no
 * company name (H11 pending), no invented promises (no response-time SLAs,
 * certifications or claims). Real branded copy lands with the client in F2.
 */
import type {
  CandidatureOutboxPayload,
  LeadOutboxPayload,
} from '@/server/outbox/topics';

export interface EmailContent {
  subject: string;
  text: string;
}

function line(label: string, value?: string): string {
  return value ? `${label}: ${value}\n` : '';
}

/** Internal notification for a new lead (to EMAIL_TO_INTERNAL, ADR-008). */
export function leadInternalNotification(
  lead: LeadOutboxPayload,
): EmailContent {
  const origen =
    lead.kind === 'contact'
      ? 'formulario de contacto'
      : 'descarga de recurso (lead magnet)';
  return {
    subject: `Nuevo lead: ${lead.email}`,
    text:
      `Se ha registrado un nuevo lead desde el ${origen}.\n\n` +
      line('Email', lead.email) +
      line('Nombre', lead.nombre) +
      line('Empresa', lead.empresa) +
      line('Servicio de interés', lead.servicio) +
      line('Recurso descargado', lead.recurso) +
      (lead.mensaje ? `\nMensaje:\n${lead.mensaje}\n` : '') +
      `\nReferencia interna: ${lead.leadId}\n`,
  };
}

/** Acknowledgement to the requester (RF-06: expectation management). */
export function leadConfirmation(lead: LeadOutboxPayload): EmailContent {
  const que =
    lead.kind === 'contact'
      ? 'tu solicitud de propuesta'
      : 'tu solicitud de descarga';
  return {
    subject: 'Hemos recibido tu solicitud',
    text:
      `Hola${lead.nombre ? ` ${lead.nombre}` : ''}:\n\n` +
      `Hemos recibido ${que} y la está revisando nuestro equipo de ` +
      `ingeniería. Te responderemos a este mismo correo.\n\n` +
      `Si no has realizado esta solicitud, puedes ignorar este mensaje.\n`,
  };
}

/** Internal notification for a new candidature (never CRM — Bible §21). */
export function candidatureInternalNotification(
  candidature: CandidatureOutboxPayload,
): EmailContent {
  return {
    subject: `Nueva candidatura: ${candidature.email}`,
    text:
      `Se ha recibido una candidatura espontánea desde la página de empleo.\n\n` +
      line('Nombre', candidature.nombre) +
      line('Email', candidature.email) +
      line('Teléfono', candidature.telefono) +
      (candidature.mensaje ? `\nMensaje:\n${candidature.mensaje}\n` : '') +
      `\nReferencia interna: ${candidature.candidatureId}\n` +
      `Datos de selección de personal: no sincronizar con el CRM.\n`,
  };
}
