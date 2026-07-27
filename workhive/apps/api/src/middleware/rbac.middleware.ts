import { Request, Response, NextFunction } from 'express';
import { ApiError } from './error-handler.middleware';
import type { Role } from '@workhive/shared';

export function requireRole(...roles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new ApiError(401, 'UNAUTHORIZED', 'Authentication required');
    }
    if (!roles.includes(req.user.role)) {
      throw new ApiError(403, 'FORBIDDEN', "You don't have permission to do that");
    }
    next();
  };
}
