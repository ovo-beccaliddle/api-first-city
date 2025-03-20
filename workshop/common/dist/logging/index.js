"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Logger = exports.LogLevel = void 0;
exports.generateRequestId = generateRequestId;
exports.requestLogger = requestLogger;
const uuid_1 = require("uuid");
/**
 * Log levels for the logging system
 */
var LogLevel;
(function (LogLevel) {
    LogLevel["DEBUG"] = "debug";
    LogLevel["INFO"] = "info";
    LogLevel["WARN"] = "warn";
    LogLevel["ERROR"] = "error";
})(LogLevel || (exports.LogLevel = LogLevel = {}));
/**
 * Centralized logger for consistent logging across services
 */
class Logger {
    constructor(context) {
        this.context = context;
    }
    /**
     * Internal method to create and output a log entry
     */
    log(level, message, data) {
        const timestamp = new Date().toISOString();
        const logEntry = {
            timestamp,
            level,
            message,
            ...this.context,
            ...(data ? { data } : {}),
        };
        // In production, you would send this to a centralized logging system
        // For the workshop, we'll just output to console with appropriate formatting
        // Format the output based on log level
        switch (level) {
            case LogLevel.ERROR:
                console.error(JSON.stringify(logEntry));
                break;
            case LogLevel.WARN:
                console.warn(JSON.stringify(logEntry));
                break;
            case LogLevel.INFO:
                console.info(JSON.stringify(logEntry));
                break;
            case LogLevel.DEBUG:
                console.debug(JSON.stringify(logEntry));
                break;
            default:
                console.log(JSON.stringify(logEntry));
        }
    }
    /**
     * Log a debug message
     */
    debug(message, data) {
        this.log(LogLevel.DEBUG, message, data);
    }
    /**
     * Log an informational message
     */
    info(message, data) {
        this.log(LogLevel.INFO, message, data);
    }
    /**
     * Log a warning message
     */
    warn(message, data) {
        this.log(LogLevel.WARN, message, data);
    }
    /**
     * Log an error message with optional error object
     */
    error(message, error, data) {
        this.log(LogLevel.ERROR, message, {
            ...(data || {}),
            stack: error?.stack,
            message: error?.message,
        });
    }
    /**
     * Create a new logger with additional context
     */
    withContext(additionalContext) {
        return new Logger({
            ...this.context,
            ...additionalContext,
        });
    }
}
exports.Logger = Logger;
/**
 * Generate a unique request ID
 */
function generateRequestId() {
    return (0, uuid_1.v4)();
}
/**
 * Express middleware for request logging
 */
function requestLogger(serviceName) {
    return (req, res, next) => {
        // Get or generate a request ID
        const requestId = req.headers['x-request-id'] || generateRequestId();
        const startTime = Date.now();
        // Add request ID header for tracing
        res.setHeader('x-request-id', requestId);
        // Create logger for this request
        const logger = new Logger({
            service: serviceName,
            requestId,
            method: req.method,
            path: req.path,
            ip: req.ip,
        });
        // Attach logger to request object for use in route handlers
        req.logger = logger;
        // Log request start
        logger.info('Request received', {
            query: req.query,
            headers: sanitizeHeaders(req.headers),
            body: sanitizeBody(req.body),
        });
        // Log request completion
        res.on('finish', () => {
            const duration = Date.now() - startTime;
            logger.info('Request completed', {
                statusCode: res.statusCode,
                duration,
                userAgent: req.headers['user-agent'],
            });
        });
        next();
    };
}
/**
 * Remove sensitive information from headers before logging
 */
function sanitizeHeaders(headers) {
    const sanitized = { ...headers };
    // Remove sensitive headers
    const sensitiveHeaders = ['authorization', 'cookie', 'x-api-key'];
    sensitiveHeaders.forEach((header) => {
        if (sanitized[header]) {
            sanitized[header] = '[REDACTED]';
        }
    });
    return sanitized;
}
/**
 * Remove sensitive information from request body before logging
 */
function sanitizeBody(body) {
    if (!body)
        return body;
    const sanitized = { ...body };
    // Remove sensitive fields
    const sensitiveFields = ['password', 'token', 'secret', 'apiKey', 'credit_card'];
    Object.keys(sanitized).forEach((key) => {
        if (sensitiveFields.includes(key.toLowerCase())) {
            sanitized[key] = '[REDACTED]';
        }
        else if (typeof sanitized[key] === 'object' && sanitized[key] !== null) {
            sanitized[key] = sanitizeBody(sanitized[key]);
        }
    });
    return sanitized;
}
//# sourceMappingURL=index.js.map