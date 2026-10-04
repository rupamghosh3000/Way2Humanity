import jwt from 'jsonwebtoken';
import { config } from '../config';

export interface TokenPayload {
  userId: string;
  email: string;
  roles: string[];
}

export function signAccessToken(payload: TokenPayload): string {
  return jwt.sign(payload, config.auth.jwtAccessSecret, { expiresIn: '1d' });
}

export function signRefreshToken(payload: TokenPayload): string {
  return jwt.sign(payload, config.auth.jwtRefreshSecret, { expiresIn: '7d' });
}

export function verifyAccessToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, config.auth.jwtAccessSecret) as TokenPayload;
  } catch {
    return null;
  }
}

export function verifyRefreshToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, config.auth.jwtRefreshSecret) as TokenPayload;
  } catch {
    return null;
  }
}
