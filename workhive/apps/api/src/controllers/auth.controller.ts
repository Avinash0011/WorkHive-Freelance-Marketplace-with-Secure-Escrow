import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service';
import { signupSchema, loginSchema } from '@workhive/shared';

const REFRESH_COOKIE = 'wh_refresh_token';
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  path: '/',
};

export const authController = {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const input = signupSchema.parse(req.body);
      const result = await authService.register(input);

      res.cookie(REFRESH_COOKIE, result.refreshToken, COOKIE_OPTIONS);
      res.status(201).json({
        success: true,
        data: {
          accessToken: result.accessToken,
          user: result.user,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const input = loginSchema.parse(req.body);
      const result = await authService.login(input);

      res.cookie(REFRESH_COOKIE, result.refreshToken, COOKIE_OPTIONS);
      res.json({
        success: true,
        data: {
          accessToken: result.accessToken,
          user: result.user,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const refreshToken = req.cookies[REFRESH_COOKIE];
      if (!refreshToken) {
        return res.status(401).json({
          success: false,
          error: { code: 'UNAUTHORIZED', message: 'No refresh token provided' },
        });
      }

      const result = await authService.refresh(refreshToken);
      res.json({
        success: true,
        data: {
          accessToken: result.accessToken,
          user: result.user,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  async logout(_req: Request, res: Response) {
    res.clearCookie(REFRESH_COOKIE, { path: '/' });
    res.json({ success: true, message: 'Logged out successfully' });
  },

  async me(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await authService.getMe(req.user!.id);
      res.json({ success: true, data: { user } });
    } catch (error) {
      next(error);
    }
  },
};
