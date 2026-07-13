/**
 * Structured JSON logging (Bible §36): one JSON object per line to stdout,
 * level-filtered, with bound context (request id, endpoint) via `child`.
 *
 * GDPR/PII policy (Bible §17/§21): logs are operational telemetry, not a data
 * store. Field values are redacted by key — personal data keys are masked,
 * secret-looking keys are dropped to a placeholder. Redaction is recursive and
 * applies to every logged field, so a handler cannot accidentally leak a lead's
 * data by logging a whole payload object.
 */
import process from 'node:process';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const LEVEL_WEIGHT: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
};

/** Keys whose values must never appear in logs (credentials & friends). */
const SECRET_KEY = /(secret|token|password|api[-_]?key|authorization)/i;

/** Personal-data keys (§28 Lead/Candidature fields) — masked, not dropped. */
const PII_KEY =
  /^(email|correo|nombre|name|apellidos|phone|telefono|tel|mensaje|message|empresa|company|ip)$/i;

export function redactEmail(value: string): string {
  const at = value.indexOf('@');
  if (at <= 0) return '[redacted]';
  return `${value.slice(0, 1)}***@${value.slice(at + 1)}`;
}

function redactValue(key: string, value: unknown): unknown {
  if (SECRET_KEY.test(key)) return '[secret]';
  if (PII_KEY.test(key)) {
    if (typeof value === 'string' && value.includes('@')) {
      return redactEmail(value);
    }
    return '[redacted]';
  }
  return redactFields(value);
}

function redactFields(value: unknown): unknown {
  if (Array.isArray(value)) return value.map((item) => redactFields(item));
  if (value instanceof Error) {
    return { name: value.name, message: value.message, stack: value.stack };
  }
  if (value !== null && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([key, entry]) => [
        key,
        redactValue(key, entry),
      ]),
    );
  }
  return value;
}

export type LogFields = Record<string, unknown>;

export interface Logger {
  debug(message: string, fields?: LogFields): void;
  info(message: string, fields?: LogFields): void;
  warn(message: string, fields?: LogFields): void;
  error(message: string, fields?: LogFields): void;
  child(fields: LogFields): Logger;
}

export interface LoggerOptions {
  level?: LogLevel;
  /** Injectable sink for tests; defaults to one JSON line on stdout. */
  write?: (line: string) => void;
  base?: LogFields;
  now?: () => Date;
}

export function createLogger(options: LoggerOptions = {}): Logger {
  const level = options.level ?? 'info';
  const write =
    options.write ?? ((line: string) => process.stdout.write(`${line}\n`));
  const base = options.base ?? {};
  const now = options.now ?? (() => new Date());

  const emit = (entryLevel: LogLevel, message: string, fields?: LogFields) => {
    if (LEVEL_WEIGHT[entryLevel] < LEVEL_WEIGHT[level]) return;
    const entry = {
      level: entryLevel,
      time: now().toISOString(),
      msg: message,
      ...(redactFields({ ...base, ...fields }) as LogFields),
    };
    write(JSON.stringify(entry));
  };

  return {
    debug: (message, fields) => emit('debug', message, fields),
    info: (message, fields) => emit('info', message, fields),
    warn: (message, fields) => emit('warn', message, fields),
    error: (message, fields) => emit('error', message, fields),
    child: (fields) =>
      createLogger({ ...options, base: { ...base, ...fields } }),
  };
}

/**
 * Process-wide default logger. Level stays at `info`: the §38 catalog defines
 * no verbosity variable, and adding one goes through the Bible first.
 */
let defaultLogger: Logger | undefined;

export function getLogger(): Logger {
  defaultLogger ??= createLogger({ base: { service: 'bff' } });
  return defaultLogger;
}
