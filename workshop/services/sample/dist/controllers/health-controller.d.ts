import { Request, Response, Router } from 'express';
/**
 * Controller for health check endpoint
 */
export declare class HealthController {
    private router;
    private version;
    constructor(version?: string);
    /**
     * Set up controller routes
     */
    private setupRoutes;
    /**
     * Get the router instance
     */
    getRouter(): Router;
    /**
     * Handle GET /health
     */
    healthCheck(_req: Request, res: Response): void;
}
