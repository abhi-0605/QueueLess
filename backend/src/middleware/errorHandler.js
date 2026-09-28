import { AppError } from '../utils/errors.js';
import { ZodError } from 'zod';
import { logger } from '../utils/logger.js';

export const errorHandler = (err, req, res, next) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: {
        code: err.code,
        message: err.message
      }
    });
  }

  if (err instanceof ZodError) {
    const issues = err.issues.map((issue) => ({
      field: issue.path.join('.'),
      message: issue.message
    }));
    return res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Request payload validation failed',
        details: issues
      }
    });
  }

  if (err.code === 'P2002') {
    return res.status(409).json({
      error: {
        code: 'DUPLICATE_ENTRY',
        message: `A record with this ${err.meta?.target?.join(', ') || 'field'} already exists.`
      }
    });
  }

  logger.error({ err, path: req.path, method: req.method }, 'Unhandled server error');

  return res.status(500).json({
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected internal server error occurred.'
    }
  });
};
