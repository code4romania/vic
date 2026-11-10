import {
  createCipheriv,
  createDecipheriv,
  hkdfSync,
  randomBytes,
} from 'crypto';

// Encrypts a secret VIC must keep and use again (an Apple refresh token): AES-256-GCM with a key
// derived from AUTH_TOKEN_KEY for this one purpose, so the HMAC key itself never encrypts.
// Format: v1.<iv>.<tag>.<ciphertext>, base64url.
const deriveKey = (authTokenKey: Buffer, purpose: string): Buffer =>
  Buffer.from(
    hkdfSync('sha256', authTokenKey, Buffer.alloc(0), `vic:${purpose}`, 32),
  );

export function sealSecret(
  authTokenKey: Buffer,
  purpose: string,
  plaintext: string,
): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv(
    'aes-256-gcm',
    deriveKey(authTokenKey, purpose),
    iv,
  );
  const encrypted = Buffer.concat([
    cipher.update(plaintext, 'utf8'),
    cipher.final(),
  ]);
  return [
    'v1',
    iv.toString('base64url'),
    cipher.getAuthTag().toString('base64url'),
    encrypted.toString('base64url'),
  ].join('.');
}

// null when the value was not sealed with this key and purpose (tampered, or another key)
export function openSecret(
  authTokenKey: Buffer,
  purpose: string,
  sealed: string,
): string | null {
  try {
    const [version, iv, tag, encrypted] = sealed.split('.');
    if (version !== 'v1') return null;
    const decipher = createDecipheriv(
      'aes-256-gcm',
      deriveKey(authTokenKey, purpose),
      Buffer.from(iv, 'base64url'),
    );
    decipher.setAuthTag(Buffer.from(tag, 'base64url'));
    return Buffer.concat([
      decipher.update(Buffer.from(encrypted, 'base64url')),
      decipher.final(),
    ]).toString('utf8');
  } catch {
    return null;
  }
}
