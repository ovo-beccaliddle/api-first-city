import { Request, Response, Router } from 'express';

/**
 * Controller for health check endpoint
 */
export class HealthController {
  private router: Router;
  private version: string;

  constructor(version = '1.0.0') {
    this.version = version;
    this.router = Router();
    this.setupRoutes();
  }

  /**
   * Set up controller routes
   */
  private setupRoutes(): void {
    this.router.get('/', this.healthCheck.bind(this));
  }

  /**
   * Get the router instance
   */
  getRouter(): Router {
    return this.router;
  }

  /**
   * Handle GET /health
   */
  healthCheck(_req: Request, res: Response): void {
    res.json({
      status: 'ok',
      version: this.version,
      timestamp: new Date().toISOString(),
    });
  }
}
