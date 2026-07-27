import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../lib/env';
import { ApiError } from './error-handler.middleware';
import type { Role } from '@workhive/shared';

// Augment Express Request
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: Role;
      };
    }
  }
}

export function authenticate(req: Request, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    throw new ApiError(401, 'UNAUTHORIZED', 'Authentication required');
  }

  const token = authHeader.slice(7);
  try {
    const payload = jwt.verify(token, env.JWT_ACCESS_SECRET) as { sub: string; role: Role };
    req.user = { id: payload.sub, role: payload.role };
    next();
  } catch (error) {
    if ((error as any).name === 'TokenExpiredError') {
      throw new ApiError(401, 'TOKEN_EXPIRED', 'Your session has expired, please log in again');
    }
    throw new ApiError(401, 'UNAUTHORIZED', 'Authentication required');
  }
}
