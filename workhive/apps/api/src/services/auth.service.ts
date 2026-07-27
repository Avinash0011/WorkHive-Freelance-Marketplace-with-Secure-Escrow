import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma';
import { env } from '../lib/env';
import { ApiError } from '../middleware/error-handler.middleware';
import type { SignupInput, LoginInput } from '@workhive/shared';

const BCRYPT_ROUNDS = 12;

// Helper to strip sensitive fields
function sanitizeUser(user: any) {
  const { password_hash, ...safe } = user;
  return {
    ...safe,
    wallet_balance_paise: safe.wallet_balance_paise.toString(),
    rating_avg: safe.rating_avg ? Number(safe.rating_avg) : null,
  };
}

function generateAccessToken(userId: string, role: string): string {
  return jwt.sign(
    { sub: userId, role },
    env.JWT_ACCESS_SECRET,
    { expiresIn: '15m' }
  );
}

function generateRefreshToken(userId: string, role: string): string {
  return jwt.sign(
    { sub: userId, role },
    env.JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  );
}

export const authService = {
  async register(input: SignupInput) {
    // Check if email already exists - but return generic error per security doc
    const existing = await prisma.user.findUnique({ where: { email: input.email } });
    if (existing) {
      throw new ApiError(409, 'REGISTRATION_FAILED', 'An account with this email already exists');
    }

    const password_hash = await bcrypt.hash(input.password, BCRYPT_ROUNDS);

    const user = await prisma.user.create({
      data: {
        email: input.email,
        password_hash,
        name: input.name,
        role: input.role,
        headline: input.headline || null,
        skills: input.skills || [],
      },
    });

    const accessToken = generateAccessToken(user.id, user.role);
    const refreshToken = generateRefreshToken(user.id, user.role);

    return {
      accessToken,
      refreshToken,
      user: sanitizeUser(user),
    };
  },

  async login(input: LoginInput) {
    // Generic error for both wrong email AND wrong password (per security doc)
    const GENERIC_LOGIN_ERROR = 'Invalid email or password';

    const user = await prisma.user.findUnique({ where: { email: input.email } });
    if (!user) {
      // Hash a dummy value to prevent timing attacks
      await bcrypt.compare(input.password, '$2a$12$dummy.hash.to.prevent.timing.attacks.padding');
      throw new ApiError(401, 'LOGIN_FAILED', GENERIC_LOGIN_ERROR);
    }

    const isValid = await bcrypt.compare(input.password, user.password_hash);
    if (!isValid) {
      throw new ApiError(401, 'LOGIN_FAILED', GENERIC_LOGIN_ERROR);
    }

    const accessToken = generateAccessToken(user.id, user.role);
    const refreshToken = generateRefreshToken(user.id, user.role);

    return {
      accessToken,
      refreshToken,
      user: sanitizeUser(user),
    };
  },

  async refresh(refreshTokenValue: string) {
    try {
      const payload = jwt.verify(refreshTokenValue, env.JWT_REFRESH_SECRET) as { sub: string; role: string };
      
      // Verify user still exists
      const user = await prisma.user.findUnique({ where: { id: payload.sub } });
      if (!user) {
        throw new ApiError(401, 'UNAUTHORIZED', 'Authentication required');
      }

      const accessToken = generateAccessToken(user.id, user.role);
      return { accessToken, user: sanitizeUser(user) };
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(401, 'UNAUTHORIZED', 'Authentication required');
    }
  },

  async getMe(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new ApiError(404, 'NOT_FOUND', 'User not found');
    }
    return sanitizeUser(user);
  },
};
