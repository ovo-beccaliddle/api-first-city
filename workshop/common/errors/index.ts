import { Request, Response, NextFunction } from 'express';

/**
 * Base API error class that all other error types extend
 */
export class ApiError extends Error {
  statusCode: number;
  errorCode: string;
  details?: unknown;

  constructor(statusCode: number, errorCode: string, message: string, details?: unknown) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.details = details;
    this.name = this.constructor.name;

    // Ensure the stack trace includes the ApiError constructor
    Error.captureStackTrace(this, this.constructor);
  }

  toJSON() {
    return {
      error: {
        code: this.errorCode,
        message: this.message,
        details: this.details,
      },
    };
  }
}

/**
 * Error thrown when a requested resource is not found
 */
export class NotFoundError extends ApiError {
  constructor(resource: string, id: string) {
    super(404, 'resource_not_found', `${resource} with id ${id} not found`);
  }
}

/**
 * Error thrown when request validation fails
 */
export class ValidationError extends ApiError {
  constructor(details: unknown) {
    super(400, 'validation_error', 'Validation failed', details);
  }
}

/**
 * Error thrown when a user doesn't have permission to access a resource
 */
export class AuthorizationError extends ApiError {
  constructor(message = 'Insufficient permissions') {
    super(403, 'forbidden', message);
  }
}

/**
 * Error thrown when authentication fails
 */
export class AuthenticationError extends ApiError {
  constructor(message = 'Authentication required') {
    super(401, 'unauthorized', message);
  }
}

/**
 * Error thrown when a dependent service is unavailable
 */
export class ServiceUnavailableError extends ApiError {
  constructor(serviceName: string, message = 'Service is currently unavailable') {
    super(503, 'service_unavailable', `${serviceName}: ${message}`);
  }
}

/**
 * Error thrown when a conflict occurs (e.g., duplicate resource)
 */
export class ConflictError extends ApiError {
  constructor(message: string) {
    super(409, 'conflict', message);
  }
}

/**
 * Express middleware for handling errors
 */
export function errorHandler(err: Error, req: Request, res: Response, next: NextFunction) {
  // If headers already sent, delegate to default Express error handler
  if (res.headersSent) {
    return next(err);
  }

  // Log the error
  console.error('Error occurred:', err);

  // Handle ApiError instances
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json(err.toJSON());
  }

  // Handle validation errors from a library like Joi or express-validator
  if (err.name === 'ValidationError') {
    const validationError = new ValidationError(err);
    return res.status(validationError.statusCode).json(validationError.toJSON());
  }

  // Handle other known error types
  // ...

  // Return generic error for unknown error types
  const genericError = new ApiError(500, 'internal_server_error', 'An unexpected error occurred');
  return res.status(genericError.statusCode).json(genericError.toJSON());
}
