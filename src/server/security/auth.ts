import crypto from 'node:crypto';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: 'student' | 'admin';
  institutionId: string;
  institutionName?: string;
  branchId?: string | null;
  courseId?: string | null;
}

const JWT_SECRET = process.env.JWT_SECRET || 'college-platform-auth-session-super-secret-key-2026';

export function hashPassword(password: string): { hash: string; salt: string } {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return { hash, salt };
}

export function verifyPassword(password: string, hash: string, salt: string): boolean {
  try {
    const derivedHash = crypto.scryptSync(password, salt, 64).toString('hex');
    const a = Buffer.from(derivedHash, 'hex');
    const b = Buffer.from(hash, 'hex');
    if (a.length !== b.length) return false;
    return crypto.timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

function base64UrlEncode(str: string): string {
  return Buffer.from(str)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

function base64UrlDecode(str: string): string {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  return Buffer.from(base64, 'base64').toString('utf8');
}

export function signToken(user: AuthUser, expiresInSeconds: number = 7 * 24 * 3600): string {
  const header = { alg: 'HS256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    ...user,
    iat: now,
    exp: now + expiresInSeconds,
  };

  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const signatureInput = `${encodedHeader}.${encodedPayload}`;

  const signature = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(signatureInput)
    .digest('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

  return `${signatureInput}.${signature}`;
}

export function verifyToken(token: string): AuthUser | null {
  try {
    if (!token || typeof token !== 'string') return null;
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const [headerB64, payloadB64, signatureB64] = parts;
    const signatureInput = `${headerB64}.${payloadB64}`;

    const expectedSignature = crypto
      .createHmac('sha256', JWT_SECRET)
      .update(signatureInput)
      .digest('base64')
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');

    const expectedBuf = Buffer.from(expectedSignature);
    const actualBuf = Buffer.from(signatureB64);

    if (expectedBuf.length !== actualBuf.length) return null;
    if (!crypto.timingSafeEqual(expectedBuf, actualBuf)) return null;

    const payload = JSON.parse(base64UrlDecode(payloadB64));
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) return null;

    return {
      id: payload.id,
      email: payload.email,
      name: payload.name,
      role: payload.role,
      institutionId: payload.institutionId,
      institutionName: payload.institutionName,
      branchId: payload.branchId || null,
      courseId: payload.courseId || null,
    };
  } catch {
    return null;
  }
}
