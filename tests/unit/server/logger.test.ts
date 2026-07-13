import { describe, it, expect } from 'vitest';
import { createLogger, redactEmail } from '@/server/logging/logger';

function capture() {
  const lines: string[] = [];
  return {
    lines,
    parsed: () => lines.map((l) => JSON.parse(l) as Record<string, unknown>),
    write: (line: string) => {
      lines.push(line);
    },
  };
}

describe('structured logger (Bible §36) — PII redaction (§17/§21)', () => {
  it('emits one JSON line with level, time and message', () => {
    const sink = capture();
    const log = createLogger({
      write: sink.write,
      now: () => new Date('2026-07-13T10:00:00Z'),
    });
    log.info('hello', { endpoint: 'leads.create' });
    expect(sink.parsed()).toEqual([
      {
        level: 'info',
        time: '2026-07-13T10:00:00.000Z',
        msg: 'hello',
        endpoint: 'leads.create',
      },
    ]);
  });

  it('filters below the configured level', () => {
    const sink = capture();
    const log = createLogger({ write: sink.write, level: 'warn' });
    log.debug('nope');
    log.info('nope');
    log.warn('yes');
    expect(sink.lines).toHaveLength(1);
  });

  it('masks PII keys recursively and keeps the email domain', () => {
    const sink = capture();
    const log = createLogger({ write: sink.write });
    log.info('lead received', {
      lead: {
        nombre: 'Nombre Apellido',
        email: 'person@example.com',
        empresa: 'ACME',
        mensaje: 'confidential project details',
      },
      kind: 'contact',
    });
    const [entry] = sink.parsed();
    const lead = entry?.lead as Record<string, unknown>;
    expect(lead.nombre).toBe('[redacted]');
    expect(lead.email).toBe('p***@example.com');
    expect(lead.empresa).toBe('[redacted]');
    expect(lead.mensaje).toBe('[redacted]');
    expect(entry?.kind).toBe('contact');
    expect(sink.lines[0]).not.toContain('Apellido');
    expect(sink.lines[0]).not.toContain('confidential');
  });

  it('drops secret-looking keys entirely', () => {
    const sink = capture();
    const log = createLogger({ write: sink.write });
    log.error('upstream failed', {
      apiKey: 'xkeyb-123',
      authorization: 'Bearer abc',
      crmWebhookSecret: 's3cr3t',
    });
    const line = sink.lines[0] ?? '';
    expect(line).not.toContain('xkeyb-123');
    expect(line).not.toContain('Bearer abc');
    expect(line).not.toContain('s3cr3t');
    expect(line).toContain('[secret]');
  });

  it('serializes Error values with name/message/stack', () => {
    const sink = capture();
    const log = createLogger({ write: sink.write });
    log.error('boom', { error: new Error('kapow') });
    const [entry] = sink.parsed();
    const err = entry?.error as Record<string, unknown>;
    expect(err.name).toBe('Error');
    expect(err.message).toBe('kapow');
    expect(typeof err.stack).toBe('string');
  });

  it('child loggers bind context', () => {
    const sink = capture();
    const log = createLogger({ write: sink.write }).child({ requestId: 'r1' });
    log.info('bound');
    expect(sink.parsed()[0]?.requestId).toBe('r1');
  });

  it('redactEmail keeps only first character and domain', () => {
    expect(redactEmail('person@example.com')).toBe('p***@example.com');
    expect(redactEmail('not-an-email')).toBe('[redacted]');
  });
});
