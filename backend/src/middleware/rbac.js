import { Forbidden, Unauthorized } from '../utils/errors.js';

export const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(Unauthorized('Authentication required', 'AUTHENTICATION_REQUIRED'));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        Forbidden(
          `Access denied. Role ${req.user.role} does not have required permissions.`,
          'INSUFFICIENT_PERMISSIONS'
        )
      );
    }

    next();
  };
};

export const requireAdmin = authorize('ROLE_ADMIN');
export const requireStaffOrAdmin = authorize('ROLE_STAFF', 'ROLE_ADMIN');
export const requireUser = authorize('ROLE_USER', 'ROLE_STAFF', 'ROLE_ADMIN');
