import { Request, Response, NextFunction, Router } from 'express';
import { ResourceService } from '@services/resource-service';
/**
 * Controller for resource endpoints
 */
export declare class ResourceController {
    private router;
    private service;
    constructor(service: ResourceService);
    /**
     * Set up controller routes
     */
    private setupRoutes;
    /**
     * Get the router instance
     */
    getRouter(): Router;
    /**
     * Handle GET /resources
     */
    getResources(req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
     * Handle GET /resources/:id
     */
    getResourceById(req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
     * Handle POST /resources
     */
    createResource(req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
     * Handle PUT /resources/:id
     */
    updateResource(req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
     * Handle DELETE /resources/:id
     */
    deleteResource(req: Request, res: Response, next: NextFunction): Promise<void>;
}
export declare const resourceRouter: Router;
