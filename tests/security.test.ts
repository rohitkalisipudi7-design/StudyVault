import test, { after } from 'node:test';
import assert from 'node:assert/strict';
import { setupTestEnvironment } from './setup';
import { encryptApiKey, decryptApiKey, maskApiKey } from '../src/server/security/encryption';
import { hashPassword, verifyPassword, signToken, verifyToken } from '../src/server/security/auth';

const env = setupTestEnvironment();
after(() => env.cleanup());

test('1. Security: AES-256-GCM Encryption at rest for BYOK keys', () => {
  const sampleKey = 'AIzaSySampleTestKeyForGeminiApi123456789';
  const encrypted = encryptApiKey(sampleKey);

  assert.ok(encrypted.encryptedKey, 'Encrypted key must exist');
  assert.ok(encrypted.iv, 'IV must exist');
  assert.ok(encrypted.authTag, 'Auth tag must exist');
  assert.equal(encrypted.keyHint, '••••••••6789', 'Masked key hint must be generated');

  // Decryption verification
  const decrypted = decryptApiKey(encrypted.encryptedKey, encrypted.iv, encrypted.authTag);
  assert.equal(decrypted, sampleKey, 'Decrypted key must match original plain key');

  // Tamper detection: modified auth tag fails
  assert.throws(() => {
    decryptApiKey(encrypted.encryptedKey, encrypted.iv, '00000000000000000000000000000000');
  }, /Failed to decrypt/);
});

test('2. Security: Password Hashing with Scrypt and Salt', () => {
  const password = 'SuperSecretCollegePassword!2026';
  const { hash, salt } = hashPassword(password);

  assert.ok(hash && salt, 'Hash and salt must be generated');
  assert.equal(verifyPassword(password, hash, salt), true, 'Valid password must verify');
  assert.equal(verifyPassword('WrongPassword', hash, salt), false, 'Incorrect password must fail');
});

test('3. Security: JWT Session Tokens', () => {
  const user = {
    id: 'user-test-1',
    email: 'test@college.edu',
    name: 'Test Student',
    role: 'student' as const,
    institutionId: 'inst-au',
    institutionName: 'Andhra University',
  };

  const token = signToken(user);
  assert.ok(token && typeof token === 'string');

  const verified = verifyToken(token);
  assert.ok(verified);
  assert.equal(verified.id, user.id);
  assert.equal(verified.institutionId, 'inst-au');
  assert.equal(verified.role, 'student');

  // Expired token rejection
  const expiredToken = signToken(user, -10);
  assert.equal(verifyToken(expiredToken), null, 'Expired token must return null');
});
