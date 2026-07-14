import { describe, it, expect } from 'vitest';
import type { AppError } from '@/server/http/errors';
import { parseLeadSubmission } from '@/server/validation/leads';
import { parseCandidatureSubmission } from '@/server/validation/candidatures';
import { isHoneypotTripped } from '@/server/validation/common';

function detailsOf(fn: () => unknown): string[] {
  try {
    fn();
  } catch (error) {
    return (error as AppError).details ?? [];
  }
  throw new Error('expected a validation error');
}

const validContact = {
  nombre: '  Nombre Apellido  ',
  email: 'Persona@Example.COM ',
  empresa: 'ACME Ingeniería',
  servicio: 'eficiencia-energetica',
  mensaje: 'Necesitamos una auditoría energética de nuestra planta.',
  consentimiento: 'on',
};

describe('lead validation — contact form (RF-06/07, approved field names)', () => {
  it('accepts the approved form payload, trimming and lowercasing', () => {
    const lead = parseLeadSubmission({ ...validContact });
    expect(lead).toEqual({
      kind: 'contact',
      nombre: 'Nombre Apellido',
      email: 'persona@example.com',
      empresa: 'ACME Ingeniería',
      servicio: 'eficiencia-energetica',
      mensaje: 'Necesitamos una auditoría energética de nuestra planta.',
    });
  });

  it('accepts JSON booleans and missing optionals', () => {
    const lead = parseLeadSubmission({
      nombre: 'XY',
      email: 'a@b.co',
      mensaje: 'Un mensaje suficientemente largo.',
      consentimiento: true,
      servicio: '',
    });
    expect(lead.kind).toBe('contact');
    if (lead.kind === 'contact') {
      expect(lead.empresa).toBeUndefined();
      expect(lead.servicio).toBeUndefined();
    }
  });

  it('collects every missing/invalid field with Spanish messages', () => {
    const details = detailsOf(() => parseLeadSubmission({}));
    expect(details).toContain('nombre: obligatorio');
    expect(details.some((d) => d.startsWith('email:'))).toBe(true);
    expect(details).toContain('mensaje: obligatorio');
    expect(details.some((d) => d.includes('política de privacidad'))).toBe(
      true,
    );
  });

  it('rejects consent that is not actively granted', () => {
    for (const consentimiento of [false, 'off', '', undefined, 'yes']) {
      const details = detailsOf(() =>
        parseLeadSubmission({ ...validContact, consentimiento }),
      );
      expect(details.some((d) => d.startsWith('consentimiento:'))).toBe(true);
    }
  });

  it('rejects an unknown service line (must match the §24 taxonomy)', () => {
    const details = detailsOf(() =>
      parseLeadSubmission({ ...validContact, servicio: 'astrologia' }),
    );
    expect(details).toContain('servicio: servicio no reconocido');
  });

  it('enforces length bounds', () => {
    expect(
      detailsOf(() =>
        parseLeadSubmission({ ...validContact, mensaje: 'corto' }),
      ),
    ).toContain('mensaje: demasiado corto (mín. 10 caracteres)');
    expect(
      detailsOf(() =>
        parseLeadSubmission({ ...validContact, nombre: 'x'.repeat(121) }),
      ),
    ).toContain('nombre: demasiado largo (máx. 120 caracteres)');
  });
});

describe('lead validation — lead magnet (RF-13)', () => {
  it('accepts email + recurso + consent', () => {
    const lead = parseLeadSubmission({
      tipo: 'lead_magnet',
      email: 'a@b.co',
      recurso: 'guia-eficiencia-energetica',
      consentimiento: 'on',
    });
    expect(lead).toEqual({
      kind: 'lead_magnet',
      email: 'a@b.co',
      recurso: 'guia-eficiencia-energetica',
    });
  });

  it('rejects malformed resource slugs and unknown tipos', () => {
    expect(
      detailsOf(() =>
        parseLeadSubmission({
          tipo: 'lead_magnet',
          email: 'a@b.co',
          recurso: '../etc/passwd',
          consentimiento: 'on',
        }),
      ),
    ).toContain('recurso: formato de identificador no válido');
    expect(detailsOf(() => parseLeadSubmission({ tipo: 'spam' }))).toContain(
      'tipo: no reconocido',
    );
  });
});

describe('candidature validation (RF-14)', () => {
  it('accepts a spontaneous candidature with optional phone', () => {
    const candidature = parseCandidatureSubmission({
      nombre: 'Persona Candidata',
      email: 'cv@example.com',
      telefono: '+34 600 000 000',
      mensaje: 'Candidatura espontánea.',
      consentimiento: 'on',
    });
    expect(candidature.telefono).toBe('+34 600 000 000');
  });

  it('rejects malformed phone numbers but allows omission', () => {
    expect(
      detailsOf(() =>
        parseCandidatureSubmission({
          nombre: 'Persona',
          email: 'cv@example.com',
          telefono: 'llámame',
          consentimiento: 'on',
        }),
      ),
    ).toContain('telefono: teléfono no válido');
    const ok = parseCandidatureSubmission({
      nombre: 'Persona',
      email: 'cv@example.com',
      telefono: '',
      consentimiento: 'on',
    });
    expect(ok.telefono).toBeUndefined();
  });

  it('requires recruitment consent', () => {
    const details = detailsOf(() =>
      parseCandidatureSubmission({ nombre: 'P X', email: 'cv@example.com' }),
    );
    expect(details.some((d) => d.startsWith('consentimiento:'))).toBe(true);
  });
});

describe('honeypot (anti-abuse, §17)', () => {
  it('trips only on a non-empty hidden website field', () => {
    expect(isHoneypotTripped({ website: 'http://spam.example' })).toBe(true);
    expect(isHoneypotTripped({ website: '   ' })).toBe(false);
    expect(isHoneypotTripped({ website: '' })).toBe(false);
    expect(isHoneypotTripped({})).toBe(false);
  });
});
