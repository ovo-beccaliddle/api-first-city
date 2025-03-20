import { Router } from 'express';
/**
 * Controller for health check endpoint
 */
export class HealthController {
    constructor(version = '1.0.0') {
        this.version = version;
        this.router = Router();
        this.setupRoutes();
    }
    /**
     * Set up controller routes
     */
    setupRoutes() {
        this.router.get('/', this.healthCheck.bind(this));
    }
    /**
     * Get the router instance
     */
    getRouter() {
        return this.router;
    }
    /**
     * Handle GET /health
     */
    healthCheck(_req, res) {
        res.json({
            status: 'ok',
            version: this.version,
            timestamp: new Date().toISOString(),
        });
    }
}
