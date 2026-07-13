/**
 * Request-body intake for the BFF (Bible §17: validate at the boundary).
 * Accepts JSON (fetch clients) and form encodings (progressive enhancement —
 * the approved zero-JS forms can POST directly), normalizes both to a plain
 * record, and enforces a hard size cap before any parsing happens.
 */
import { AppError } from '@/server/http/errors';

/** Forms here are small (contact/candidature); 64 KiB is generous. */
export const MAX_BODY_BYTES = 64 * 1024;

function assertWithinLimit(bytes: number): void {
  if (bytes > MAX_BODY_BYTES) throw AppError.payloadTooLarge(MAX_BODY_BYTES);
}

export async function readBody(
  request: Request,
): Promise<Record<string, unknown>> {
  const declared = Number(request.headers.get('content-length') ?? '0');
  if (Number.isFinite(declared)) assertWithinLimit(declared);

  const contentType = (request.headers.get('content-type') ?? '')
    .split(';', 1)[0]
    ?.trim()
    .toLowerCase();

  if (contentType === 'application/json') {
    const text = await request.text();
    assertWithinLimit(new TextEncoder().encode(text).byteLength);
    let parsed: unknown;
    try {
      parsed = JSON.parse(text);
    } catch {
      throw AppError.invalidJson();
    }
    if (
      parsed === null ||
      typeof parsed !== 'object' ||
      Array.isArray(parsed)
    ) {
      throw AppError.validation(['body: must be a JSON object']);
    }
    return parsed as Record<string, unknown>;
  }

  if (
    contentType === 'application/x-www-form-urlencoded' ||
    contentType === 'multipart/form-data'
  ) {
    const form = await request.formData();
    const record: Record<string, unknown> = {};
    for (const [key, value] of form.entries()) {
      // File parts (CV upload) are a deferred decision — storage/AV scanning
      // per Bible §17; only scalar fields are accepted for now.
      if (typeof value === 'string') record[key] = value;
    }
    return record;
  }

  throw AppError.unsupportedMediaType();
}
