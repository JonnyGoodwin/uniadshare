import { createHmac, timingSafeEqual } from 'node:crypto';

const tokenPayloadSchema = {
  is(value: unknown): value is { email: string; exp: number } {
    if (!value || typeof value !== 'object') return false;
    const candidate = value as Record<string, unknown>;
    return typeof candidate.email === 'string' && typeof candidate.exp === 'number';
  }
};

function signPayload(payload: string, secret: string): string {
  return createHmac('sha256', secret).update(payload).digest('base64url');
}

export function issueAdminSessionToken(params: {
  email: string;
  secret: string;
  ttlHours: number;
}): string {
  const exp = Math.floor(Date.now() / 1000) + Math.max(1, Math.floor(params.ttlHours)) * 60 * 60;
  const payload = Buffer.from(JSON.stringify({ email: params.email, exp }), 'utf8').toString('base64url');
  const signature = signPayload(payload, params.secret);
  return `${payload}.${signature}`;
}

export function verifyAdminSessionToken(
  token: string,
  secret: string
): { email: string; exp: number } | null {
  const [payload, signature] = token.split('.');
  if (!payload || !signature) return null;

  const expected = signPayload(payload, secret);
  const actualBuffer = Buffer.from(signature, 'utf8');
  const expectedBuffer = Buffer.from(expected, 'utf8');
  if (actualBuffer.length !== expectedBuffer.length) return null;
  if (!timingSafeEqual(actualBuffer, expectedBuffer)) return null;

  let parsed: unknown;
  try {
    parsed = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
  } catch {
    return null;
  }

  if (!tokenPayloadSchema.is(parsed)) return null;
  if (parsed.exp <= Math.floor(Date.now() / 1000)) return null;

  return parsed;
}

export function extractBearerToken(headerValue: string | string[] | undefined): string | null {
  if (!headerValue || Array.isArray(headerValue)) return null;
  if (!headerValue.toLowerCase().startsWith('bearer ')) return null;
  const token = headerValue.slice(7).trim();
  return token.length > 0 ? token : null;
}
