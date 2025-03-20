import { Request, Response, NextFunction } from 'express';
/**
 * Base API error class that all other error types extend
 */
export declare class ApiError extends Error {
    statusCode: number;
    errorCode: string;
    details?: unknown;
    constructor(statusCode: number, errorCode: string, message: string, details?: unknown);
    toJSON(): {
        error: {
            code: string;
            message: string;
            details: unknown;
        };
    };
}
/**
 * Error thrown when a requested resource is not found
 */
export declare class NotFoundError extends ApiError {
    constructor(resource: string, id: string);
}
/**
 * Error thrown when request validation fails
 */
export declare class ValidationError extends ApiError {
    constructor(details: unknown);
}
/**
 * Error thrown when a user doesn't have permission to access a resource
 */
export declare class AuthorizationError extends ApiError {
    constructor(message?: string);
}
/**
 * Error thrown when authentication fails
 */
export declare class AuthenticationError extends ApiError {
    constructor(message?: string);
}
/**
 * Error thrown when a dependent service is unavailable
 */
export declare class ServiceUnavailableError extends ApiError {
    constructor(serviceName: string, message?: string);
}
/**
 * Error thrown when a conflict occurs (e.g., duplicate resource)
 */
export declare class ConflictError extends ApiError {
    constructor(message: string);
}
/**
 * Express middleware for handling errors
 */
export declare function errorHandler(err: Error, req: Request, res: Response, next: NextFunction): void | Response<any, Record<string, any>>;
