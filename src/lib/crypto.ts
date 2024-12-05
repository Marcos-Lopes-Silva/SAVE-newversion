import bcrypt from 'bcrypt';
import crypto from 'crypto';

export async function hashToken(token: string): Promise<string> {
  const saltRounds = 10;
  return await bcrypt.hash(token, saltRounds);
}

export async function compareToken(token: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(token, hash);
}
