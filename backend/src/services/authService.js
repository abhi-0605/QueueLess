import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { userRepository } from '../repositories/userRepository.js';
import { Conflict, Unauthorized } from '../utils/errors.js';

const SALT_ROUNDS = 10;

const generateTokens = (user) => {
  const payload = {
    userId: user.id,
    email: user.email,
    role: user.role,
    organizationId: user.organization_id
  };

  const accessToken = jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN
  });

  const refreshToken = jwt.sign(payload, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN
  });

  return { accessToken, refreshToken };
};

export const authService = {
  register: async ({ name, email, password, role = 'ROLE_USER', organization_id = null }) => {
    const existing = await userRepository.findByEmail(email.toLowerCase().trim());
    if (existing) {
      throw Conflict('An account with this email address already exists.', 'EMAIL_EXISTS');
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    const user = await userRepository.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password_hash: passwordHash,
      role,
      organization_id
    });

    const tokens = generateTokens(user);

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        organization_id: user.organization_id
      },
      ...tokens
    };
  },

  login: async ({ email, password }) => {
    const user = await userRepository.findByEmail(email.toLowerCase().trim());
    if (!user) {
      throw Unauthorized('Invalid email or password credentials.', 'INVALID_CREDENTIALS');
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      throw Unauthorized('Invalid email or password credentials.', 'INVALID_CREDENTIALS');
    }

    const tokens = generateTokens(user);

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        organization_id: user.organization_id
      },
      ...tokens
    };
  },

  refresh: async (refreshToken) => {
    if (!refreshToken) {
      throw Unauthorized('Refresh token is required.', 'TOKEN_REQUIRED');
    }

    let decoded;
    try {
      decoded = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET);
    } catch {
      throw Unauthorized('Invalid or expired refresh token.', 'TOKEN_INVALID');
    }

    const user = await userRepository.findById(decoded.userId);
    if (!user) {
      throw Unauthorized('User not found.', 'USER_NOT_FOUND');
    }

    const tokens = generateTokens(user);

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user
    };
  }
};
