import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';

export async function setRLSContext(req: Request, res: Response, next: NextFunction) {
  if (req.user?.id) {
    await prisma.$executeRaw`SELECT app.set_current_user_id(${req.user.id})`;
  }
  next();
}
