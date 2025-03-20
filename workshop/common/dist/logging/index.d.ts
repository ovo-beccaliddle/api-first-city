import { Request, Response, NextFunction } from 'express';
/**
 * Log levels for the logging system
 */
export declare enum LogLevel {
    DEBUG = "debug",
    INFO = "info",
    WARN = "warn",
    ERROR = "error"
}
/**
 * Context information attached to log entries
 */
export interface LogContext {
    service: string;
    requestId?: string;
    userId?: string;
    [key: string]: any;
}
/**
 * Centralized logger for consistent logging across services
 */
export declare class Logger {
    private context;
    constructor(context: LogContext);
    /**
     * Internal method to create and output a log entry
     */
    private log;
    /**
     * Log a debug message
     */
    debug(message: string, data?: any): void;
    /**
     * Log an informational message
     */
    info(message: string, data?: any): void;
    /**
     * Log a warning message
     */
    warn(message: string, data?: any): void;
    /**
     * Log an error message with optional error object
     */
    error(message: string, error?: Error, data?: any): void;
    /**
     * Create a new logger with additional context
     */
    withContext(additionalContext: Partial<LogContext>): Logger;
}
/**
 * Generate a unique request ID
 */
export declare function generateRequestId(): string;
/**
 * Express middleware for request logging
 */
export declare function requestLogger(serviceName: string): (req: Request, res: Response, next: NextFunction) => void;
