import { randomBytes, scryptSync, timingSafeEqual } from 'crypto';

const KEY_LEN = 64;

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex');
  const derived = scryptSync(password, salt, KEY_LEN).toString('hex');
  return `${salt}:${derived}`;
}

export function verifyPassword(password: string, storedValue: string): boolean {
  const [salt, savedHash] = storedValue.split(':');
  if (!salt || !savedHash) return false;

  const derived = scryptSync(password, salt, KEY_LEN);
  const saved = Buffer.from(savedHash, 'hex');

  if (derived.length !== saved.length) return false;
  return timingSafeEqual(derived, saved);
}
