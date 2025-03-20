// Mock for @city-services/common package
import { vi } from 'vitest';

// Mock for error handler middleware
export const errorHandler = vi.fn((err, req, res, next) => {
  // Simple implementation that passes the error to the next middleware
  if (next) {
    next(err);
  }
});

// Mock for request logger middleware
export const requestLogger = vi.fn((serviceName) => {
  // Return a middleware function that simply calls next
  return (req: any, res: any, next: any) => {
    if (typeof next === 'function') {
      next();
    }
  };
});
