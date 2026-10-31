import crypto from 'node:crypto';

const MASTER_SECRET = process.env.ENCRYPTION_KEY || 'college-resource-platform-secret-encryption-key-32b!';

function getEncryptionKey(): Buffer {
  return crypto.createHash('sha256').update(MASTER_SECRET).digest();
}

export interface EncryptedResult {
  encryptedKey: string;
  iv: string;
  authTag: string;
  keyHint: string;
}

export function encryptApiKey(plainKey: string): EncryptedResult {
  if (!plainKey || typeof plainKey !== 'string') {
    throw new Error('API key must be a non-empty string');
  }

  const key = getEncryptionKey();
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);

  let encrypted = cipher.update(plainKey, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag().toString('hex');

  const visibleChars = plainKey.length > 4 ? plainKey.slice(-4) : plainKey;
  const keyHint = `••••••••${visibleChars}`;

  return {
    encryptedKey: encrypted,
    iv: iv.toString('hex'),
    authTag,
    keyHint,
  };
}

export function decryptApiKey(encryptedKey: string, ivHex: string, authTagHex: string): string {
  try {
    const key = getEncryptionKey();
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');

    const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encryptedKey, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (err: any) {
    throw new Error('Failed to decrypt stored API key. Master secret may have changed.');
  }
}

export function maskApiKey(key: string): string {
  if (!key) return '';
  return `••••••••${key.slice(-4)}`;
}
