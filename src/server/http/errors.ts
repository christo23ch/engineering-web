/**
 * BFF error taxonomy (Bible §17 security / §36 logs). One class, closed set of
 * codes, explicit HTTP mapping. `expose === true` messages are client-safe;
 * everything else is replaced by a generic message at the HTTP boundary so
 * internals (SQL, vendor payloads, stack frames) never leak to the client.
 */

export type ErrorCode =
  | 'validation_failed'
  | 'invalid_json'
  | 'unauthorized'
  | 'not_found'
  | 'method_not_allowed'
  | 'payload_too_large'
  | 'unsupported_media_type'
  | 'rate_limited'
  | 'not_configured'
  | 'upstream_error'
  | 'invalid_configuration'
  | 'internal_error';

interface AppErrorOptions {
  /** Client-visible detail strings (e.g. per-field validation issues). */
  details?: string[];
  /** Extra response headers (e.g. Retry-After, Allow). */
  headers?: Record<string, string>;
  cause?: unknown;
  /** Whether `message` is safe to send to the client. Default: status < 500. */
  expose?: boolean;
}

export class AppError extends Error {
  readonly code: ErrorCode;
  readonly status: number;
  readonly details?: string[];
  readonly headers?: Record<string, string>;
  readonly expose: boolean;

  constructor(
    code: ErrorCode,
    status: number,
    message: string,
    options: AppErrorOptions = {},
  ) {
    super(message, options.cause ? { cause: options.cause } : undefined);
    this.name = 'AppError';
    this.code = code;
    this.status = status;
    this.details = options.details;
    this.headers = options.headers;
    this.expose = options.expose ?? status < 500;
  }

  static validation(details: string[]): AppError {
    return new AppError('validation_failed', 400, 'Validation failed', {
      details,
    });
  }

  static invalidJson(): AppError {
    return new AppError('invalid_json', 400, 'Body is not valid JSON');
  }

  static unauthorized(): AppError {
    return new AppError('unauthorized', 401, 'Unauthorized');
  }

  static notFound(): AppError {
    return new AppError('not_found', 404, 'Not found');
  }

  static methodNotAllowed(allowed: string[]): AppError {
    return new AppError('method_not_allowed', 405, 'Method not allowed', {
      headers: { allow: allowed.join(', ') },
    });
  }

  static payloadTooLarge(limitBytes: number): AppError {
    return new AppError(
      'payload_too_large',
      413,
      `Body exceeds ${String(limitBytes)} bytes`,
    );
  }

  static unsupportedMediaType(): AppError {
    return new AppError(
      'unsupported_media_type',
      415,
      'Unsupported content type',
    );
  }

  static rateLimited(retryAfterSeconds: number): AppError {
    return new AppError('rate_limited', 429, 'Too many requests', {
      headers: { 'retry-after': String(retryAfterSeconds) },
    });
  }

  static notConfigured(capability: string): AppError {
    return new AppError(
      'not_configured',
      503,
      `Service temporarily unavailable (${capability})`,
      // 503s are exposable here by design: the message names the capability
      // (e.g. "database"), never a value.
      { expose: true, headers: { 'retry-after': '3600' } },
    );
  }

  static upstream(service: string, cause?: unknown): AppError {
    return new AppError('upstream_error', 502, `Upstream error (${service})`, {
      cause,
    });
  }

  static internal(cause?: unknown): AppError {
    return new AppError('internal_error', 500, 'Internal error', { cause });
  }
}

/** Normalize any thrown value to an AppError (unknowns become 500s). */
export function toAppError(error: unknown): AppError {
  if (error instanceof AppError) return error;
  return AppError.internal(error);
}

/**
 * Classify integration failures for the outbox retry policy (ADR-010):
 * network errors, 429 and 5xx are transient; other 4xx are permanent.
 */
export class IntegrationError extends Error {
  readonly service: string;
  readonly status?: number;
  readonly retryable: boolean;

  constructor(
    service: string,
    message: string,
    options: { status?: number; retryable?: boolean; cause?: unknown } = {},
  ) {
    super(message, options.cause ? { cause: options.cause } : undefined);
    this.name = 'IntegrationError';
    this.service = service;
    this.status = options.status;
    this.retryable =
      options.retryable ??
      (options.status === undefined ||
        options.status === 429 ||
        options.status >= 500);
  }
}

export function isRetryableError(error: unknown): boolean {
  if (error instanceof IntegrationError) return error.retryable;
  if (error instanceof AppError) return false;
  // Unknown failures (network resets, timeouts…) default to retryable.
  return true;
}
