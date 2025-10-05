const crypto = require('crypto');

const ALGO = 'aes-256-gcm';
const IV_LENGTH = 12;  // Recommended size for GCM
const KEY_LENGTH = 32; // 256-bit key

function getKey(secret) {
  if (!secret) throw new Error('Missing secret key');
  return crypto.createHash('sha256').update(String(secret)).digest();
}

/**
 * Encrypts a numeric ID and returns a compact base64url-safe string
 */
function encryptId(id, secret = process.env.ID_ENC_SECRET_KEY) {
  if (!secret) throw new Error('Secret key not provided or missing in environment.');
  if (typeof id === 'undefined' || id === null) throw new Error('ID is required.');

  const key = getKey(secret);
  const iv = crypto.randomBytes(IV_LENGTH);

  const cipher = crypto.createCipheriv(ALGO, key, iv, { authTagLength: 16 });
  const encrypted = Buffer.concat([
    cipher.update(String(id), 'utf8'),
    cipher.final()
  ]);
  const authTag = cipher.getAuthTag();

  // Combine iv + tag + encrypted data
  const payload = Buffer.concat([iv, authTag, encrypted]);

  // Convert to URL-safe base64 (replace +,/)
  return payload.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/**
 * Decrypts a base64url-safe encrypted ID back to plain ID
 */
function decryptId(encryptedId, secret = process.env.ID_ENC_SECRET_KEY) {
  if (!secret) throw new Error('Secret key not provided or missing in environment.');
  if (!encryptedId) throw new Error('Encrypted ID is required.');

  const key = getKey(secret);

  // Convert URL-safe base64 back to normal
  const data = Buffer.from(encryptedId.replace(/-/g, '+').replace(/_/g, '/'), 'base64');

  const iv = data.subarray(0, IV_LENGTH);
  const authTag = data.subarray(IV_LENGTH, IV_LENGTH + 16);
  const encrypted = data.subarray(IV_LENGTH + 16);

  const decipher = crypto.createDecipheriv(ALGO, key, iv, { authTagLength: 16 });
  decipher.setAuthTag(authTag);

  const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
  return decrypted.toString('utf8');
}

module.exports = { encryptId, decryptId };
