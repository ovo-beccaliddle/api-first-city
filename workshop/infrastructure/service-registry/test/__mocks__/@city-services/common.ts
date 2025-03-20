import { vi } from 'vitest';

// Mock middleware for testing
export const errorHandler = vi.fn((err: any, req: any, res: any, next: any) => next(err));
export const requestLogger = vi.fn((service: string) => {
  return (req: any, res: any, next: any) => next();
});
