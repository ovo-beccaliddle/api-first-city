import { Request, Response, NextFunction } from 'express';
/**
 * Middleware to validate requests and responses based on OpenAPI schemas
 */
export declare function validateOpenAPI(): (req: Request, res: Response, next: NextFunction) => Promise<void>;
