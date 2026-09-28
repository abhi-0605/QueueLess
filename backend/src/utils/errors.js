export class AppError extends Error {
  constructor(message, statusCode = 500, code = 'INTERNAL_ERROR') {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.code = code;
  }
}

export const BadRequest = (message = 'Bad Request', code = 'BAD_REQUEST') =>
  new AppError(message, 400, code);

export const Unauthorized = (message = 'Unauthorized', code = 'UNAUTHORIZED') =>
  new AppError(message, 401, code);

export const Forbidden = (message = 'Forbidden', code = 'FORBIDDEN') =>
  new AppError(message, 403, code);

export const NotFound = (message = 'Resource not found', code = 'NOT_FOUND') =>
  new AppError(message, 404, code);

export const Conflict = (message = 'Conflict', code = 'CONFLICT') =>
  new AppError(message, 409, code);
