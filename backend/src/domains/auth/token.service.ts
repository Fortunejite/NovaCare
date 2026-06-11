import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import config from '@/config';
import { RefreshTokenPayload, UserDto } from '@app/shared';


class TokenService {
  generateAccessToken(payload: UserDto): string {
    return jwt.sign(payload, config.jwtSecret, { expiresIn: '10m' });
  }

  generateRefreshToken(userId: string, rememberMe = false): string {
    return jwt.sign({ userId, rememberMe }, config.refreshToken, {
      expiresIn: rememberMe ? '30d' : '7d',
    });
  }

  verifyAccessToken(token: string): UserDto | null {
    try {
      return jwt.verify(token, config.jwtSecret) as UserDto;
    } catch {
      return null;
    }
  }

  verifyRefreshToken(token: string): RefreshTokenPayload | null {
    try {
      return jwt.verify(token, config.refreshToken) as RefreshTokenPayload;
    } catch {
      return null;
    }
  }

  generateResetToken(): string {
    return crypto.randomInt(100000, 999999).toString();
  }
}
export const tokenService = new TokenService();
