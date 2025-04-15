import { randomBytes, scryptSync } from 'node:crypto';

export function hashPassword(password: string) {
  // Generate a random salt
  const salt = randomBytes(16).toString('hex');
  // Hash the password with the salt
  const hash = scryptSync(password, salt, 64).toString('hex');
  // Return the salt and hash combined
  return `${salt}:${hash}`;
}

export function verifyPassword(storedPassword: string, inputPassword: string): boolean {
  const [salt, hash] = storedPassword.split(':');
  const inputHash = scryptSync(inputPassword, salt, 64).toString('hex');
  return hash === inputHash;
}
