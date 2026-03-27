import bcrypt from 'bcrypt';
import crypto from 'crypto';

const SALT_ROUNDS = 10;

export async function hashToken(value: string) {
  return await bcrypt.hash(value, SALT_ROUNDS);
}

export function createSearchHash(value: string) {
  return crypto
    .createHash("sha256")
    .update(value)
    .digest("hex");
}

export async function compareToken(value: string, hash: string) {
  return await bcrypt.compare(value, hash);
}