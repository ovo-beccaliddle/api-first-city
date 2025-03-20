import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

/**
 * Log levels for the logging system
 */
export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
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
export class Logger {
  private context: LogContext;

  constructor(context: LogContext) {
    this.context = context;
  }

  /**
   * Internal method to create and output a log entry
   */
  private log(level: LogLevel, message: string, data?: any) {
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
  debug(message: string, data?: any) {
    this.log(LogLevel.DEBUG, message, data);
  }

  /**
   * Log an informational message
   */
  info(message: string, data?: any) {
    this.log(LogLevel.INFO, message, data);
  }

  /**
   * Log a warning message
   */
  warn(message: string, data?: any) {
    this.log(LogLevel.WARN, message, data);
  }

  /**
   * Log an error message with optional error object
   */
  error(message: string, error?: Error, data?: any) {
    this.log(LogLevel.ERROR, message, {
      ...(data || {}),
      stack: error?.stack,
      message: error?.message,
    });
  }

  /**
   * Create a new logger with additional context
   */
  withContext(additionalContext: Partial<LogContext>) {
    return new Logger({
      ...this.context,
      ...additionalContext,
    });
  }
}

/**
 * Generate a unique request ID
 */
export function generateRequestId(): string {
  return uuidv4();
}

/**
 * Express middleware for request logging
 */
export function requestLogger(serviceName: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    // Get or generate a request ID
    const requestId = (req.headers['x-request-id'] as string) || generateRequestId();
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
    (req as any).logger = logger;

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
function sanitizeHeaders(headers: any): any {
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
function sanitizeBody(body: any): any {
  if (!body) return body;

  const sanitized = { ...body };

  // Remove sensitive fields
  const sensitiveFields = ['password', 'token', 'secret', 'apiKey', 'credit_card'];

  Object.keys(sanitized).forEach((key) => {
    if (sensitiveFields.includes(key.toLowerCase())) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof sanitized[key] === 'object' && sanitized[key] !== null) {
      sanitized[key] = sanitizeBody(sanitized[key]);
    }
  });

  return sanitized;
}
