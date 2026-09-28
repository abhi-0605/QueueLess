import { z } from 'zod';
import { authService } from '../services/authService.js';

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['ROLE_USER', 'ROLE_STAFF', 'ROLE_ADMIN']).optional(),
  organization_id: z.string().uuid().nullable().optional()
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address format'),
  password: z.string().min(1, 'Password is required')
});

export const refreshSchema = z.object({
  refreshToken: z.string().min(10, 'Refresh token required')
});

export const authController = {
  register: async (req, res, next) => {
    try {
      const result = await authService.register(req.body);
      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  },

  login: async (req, res, next) => {
    try {
      const result = await authService.login(req.body);
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  },

  refresh: async (req, res, next) => {
    try {
      const refreshToken = req.body.refreshToken || req.headers['x-refresh-token'];
      const result = await authService.refresh(refreshToken);
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  },

  logout: async (req, res) => {
    res.status(200).json({ message: 'Successfully logged out' });
  },

  me: async (req, res) => {
    res.status(200).json({ user: req.user });
  }
};
