import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { Unauthorized } from '../utils/errors.js';
import prisma from '../config/db.js';

export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw Unauthorized('Authentication token required', 'TOKEN_REQUIRED');
    }

    const token = authHeader.split(' ')[1];
    let decoded;
    try {
      decoded = jwt.verify(token, env.JWT_SECRET);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        throw Unauthorized('Token has expired', 'TOKEN_EXPIRED');
      }
      throw Unauthorized('Invalid authentication token', 'TOKEN_INVALID');
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        organization_id: true
      }
    });

    if (!user) {
      throw Unauthorized('User no longer exists', 'USER_NOT_FOUND');
    }

    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
};
