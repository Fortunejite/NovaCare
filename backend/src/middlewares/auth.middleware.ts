/// <reference path="../types/express.d.ts" />
import { tokenService } from '@/domains/auth/token.service';
import { ForbiddenError, UnAuthorizedError } from '@/lib/errors';
import { Role } from '@prisma/client';
import { Request, Response, NextFunction } from 'express';

export const Authorize = (roles?: Role[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const token = req.cookies.accessToken;

    if (!token) {
      throw new UnAuthorizedError('Login required');
    }

    const payload = tokenService.verifyAccessToken(token);

    if (!payload) {
      throw new UnAuthorizedError(
        'Invalid or expired session, please log in again',
      );
    }

    req.user = payload;

    if (roles && !roles.includes(req.user.role)) {
      throw new ForbiddenError('Insufficient permissions');
    }
    next();
  };
};
