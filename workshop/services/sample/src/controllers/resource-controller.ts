import { Request, Response, NextFunction, Router } from 'express';
import { HttpStatus, ValidationError } from '@city-services/common';
import { ResourceService } from '../services/resource-service';
import { ResourceRepository } from '../repositories/resource-repository';
import { validateOpenAPI } from '../middleware/openapi-validator.middleware';


/**
 * Controller for resource endpoints
 */
export class ResourceController {
  private router: Router;
  private service: ResourceService;

  constructor(service: ResourceService) {
    this.service = service;
    this.router = Router();
    this.setupRoutes();
  }

  /**
   * Set up controller routes
   */
  private setupRoutes(): void {
    // Add validation middleware to all routes
    this.router.use(validateOpenAPI());

    // Get all resources
    this.router.get('/', this.getResources.bind(this));

    // Create a new resource
    this.router.post('/', this.createResource.bind(this));

    // Get a resource by ID
    this.router.get('/:id', this.getResourceById.bind(this));

    // Update a resource
    this.router.put('/:id', this.updateResource.bind(this));

    // Delete a resource
    this.router.delete('/:id', this.deleteResource.bind(this));
  }

  /**
   * Get the router instance
   */
  getRouter(): Router {
    return this.router;
  }

  /**
   * Handle GET /resources
   */
  async getResources(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { name, page, page_size } = req.query;
      const resources = await this.service.getResources({
        name: name as string,
        page: Number.parseInt(page as string),
        page_size: Number.parseInt(page_size as string),
      });
      res.json(resources);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Handle GET /resources/:id
   */
  async getResourceById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      if (!id) {
        throw new ValidationError({ path: 'id', message: 'Resource ID is required' });
      }
      const resource = await this.service.getResourceById(id);
      res.json(resource);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Handle POST /resources
   */
  async createResource(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const newResource = await this.service.createResource(req.body);
      res.status(HttpStatus.CREATED).json(newResource);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Handle PUT /resources/:id
   */
  async updateResource(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      if (!id) {
        throw new ValidationError({ path: 'id', message: 'Resource ID is required' });
      }
      const updatedResource = await this.service.updateResource(id, req.body);
      res.json(updatedResource);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Handle DELETE /resources/:id
   */
  async deleteResource(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      if (!id) {
        throw new ValidationError({ path: 'id', message: 'Resource ID is required' });
      }
      await this.service.deleteResource(id);
      res.status(HttpStatus.NO_CONTENT).end();
    } catch (error) {
      next(error);
    }
  }
}

// Create router instance with service
const resourceService = new ResourceService(new ResourceRepository());
const resourceController = new ResourceController(resourceService);
export const resourceRouter = resourceController.getRouter();
