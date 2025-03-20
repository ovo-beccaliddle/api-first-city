"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConflictError = exports.ServiceUnavailableError = exports.AuthenticationError = exports.AuthorizationError = exports.ValidationError = exports.NotFoundError = exports.ApiError = void 0;
exports.errorHandler = errorHandler;
/**
 * Base API error class that all other error types extend
 */
class ApiError extends Error {
    constructor(statusCode, errorCode, message, details) {
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
exports.ApiError = ApiError;
/**
 * Error thrown when a requested resource is not found
 */
class NotFoundError extends ApiError {
    constructor(resource, id) {
        super(404, 'resource_not_found', `${resource} with id ${id} not found`);
    }
}
exports.NotFoundError = NotFoundError;
/**
 * Error thrown when request validation fails
 */
class ValidationError extends ApiError {
    constructor(details) {
        super(400, 'validation_error', 'Validation failed', details);
    }
}
exports.ValidationError = ValidationError;
/**
 * Error thrown when a user doesn't have permission to access a resource
 */
class AuthorizationError extends ApiError {
    constructor(message = 'Insufficient permissions') {
        super(403, 'forbidden', message);
    }
}
exports.AuthorizationError = AuthorizationError;
/**
 * Error thrown when authentication fails
 */
class AuthenticationError extends ApiError {
    constructor(message = 'Authentication required') {
        super(401, 'unauthorized', message);
    }
}
exports.AuthenticationError = AuthenticationError;
/**
 * Error thrown when a dependent service is unavailable
 */
class ServiceUnavailableError extends ApiError {
    constructor(serviceName, message = 'Service is currently unavailable') {
        super(503, 'service_unavailable', `${serviceName}: ${message}`);
    }
}
exports.ServiceUnavailableError = ServiceUnavailableError;
/**
 * Error thrown when a conflict occurs (e.g., duplicate resource)
 */
class ConflictError extends ApiError {
    constructor(message) {
        super(409, 'conflict', message);
    }
}
exports.ConflictError = ConflictError;
/**
 * Express middleware for handling errors
 */
function errorHandler(err, req, res, next) {
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
//# sourceMappingURL=index.js.map