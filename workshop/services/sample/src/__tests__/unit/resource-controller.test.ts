import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Request, Response, NextFunction } from 'express';
import { ResourceController } from '../../controllers/resource-controller';
import { ResourceService } from '../../services/resource-service';
import { NotFoundError, ValidationError } from '@city-services/common';
import { ResourceStatus, Resource, ResourceList } from '../../generated/types.gen';

// Mock the ResourceService
vi.mock('../../services/resource-service', () => {
  return {
    ResourceService: vi.fn().mockImplementation(() => ({
      getResources: vi.fn(),
      getResourceById: vi.fn(),
      createResource: vi.fn(),
      updateResource: vi.fn(),
      deleteResource: vi.fn()
    }))
  };
});

// Mock express middleware
vi.mock('../../middleware/openapi-validator.middleware', () => ({
  validateOpenAPI: vi.fn().mockReturnValue((req: Request, res: Response, next: NextFunction) => next())
}));

describe('ResourceController', () => {
  let controller: ResourceController;
  let service: ResourceService;
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  // Sample resource data for testing
  const mockResource: Resource = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    name: 'Test Resource',
    description: 'Test Description',
    status: ResourceStatus.ACTIVE,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  const mockResourceList: ResourceList = {
    items: [mockResource],
    total: 1,
    page: 1,
    page_size: 20
  };

  beforeEach(() => {
    // Create fresh mocks for each test
    service = new ResourceService({} as any);
    controller = new ResourceController(service);

    // Mock Express request, response, and next function
    req = {
      params: {},
      query: {},
      body: {}
    };

    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
      end: vi.fn()
    };

    next = vi.fn();
  });

  describe('getResources', () => {
    it('should return resources with default options', async () => {
      // Setup mocks
      vi.mocked(service.getResources).mockResolvedValue(mockResourceList);

      // Call controller method
      await controller.getResources(req as Request, res as Response, next);

      // Assertions
      expect(service.getResources).toHaveBeenCalledWith({
        name: undefined,
        page: NaN,
        page_size: NaN
      });
      expect(res.json).toHaveBeenCalledWith(mockResourceList);
    });

    it('should return resources with query parameters', async () => {
      // Setup request with query params
      req.query = {
        name: 'Test',
        page: '2',
        page_size: '10'
      };

      // Setup service mock
      vi.mocked(service.getResources).mockResolvedValue({
        ...mockResourceList,
        page: 2,
        page_size: 10
      });

      // Call controller method
      await controller.getResources(req as Request, res as Response, next);

      // Assertions
      expect(service.getResources).toHaveBeenCalledWith({
        name: 'Test',
        page: 2,
        page_size: 10
      });
      expect(res.json).toHaveBeenCalled();
    });

    it('should handle errors', async () => {
      // Setup service to throw error
      const error = new Error('Test error');
      vi.mocked(service.getResources).mockRejectedValue(error);

      // Call controller method
      await controller.getResources(req as Request, res as Response, next);

      // Assertions
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('getResourceById', () => {
    it('should return a resource when it exists', async () => {
      // Setup request params
      req.params = { id: mockResource.id };

      // Setup service mock
      vi.mocked(service.getResourceById).mockResolvedValue(mockResource);

      // Call controller method
      await controller.getResourceById(req as Request, res as Response, next);

      // Assertions
      expect(service.getResourceById).toHaveBeenCalledWith(mockResource.id);
      expect(res.json).toHaveBeenCalledWith(mockResource);
    });

    it('should forward NotFoundError to next middleware', async () => {
      // Setup request params
      req.params = { id: 'non-existent-id' };

      // Setup service to throw NotFoundError
      const error = new NotFoundError('Resource', 'non-existent-id');
      vi.mocked(service.getResourceById).mockRejectedValue(error);

      // Call controller method
      await controller.getResourceById(req as Request, res as Response, next);

      // Assertions
      expect(next).toHaveBeenCalledWith(error);
    });

    it('should throw ValidationError when id is missing', async () => {
      // Setup empty params (missing id)
      req.params = {};

      // Call controller method
      await controller.getResourceById(req as Request, res as Response, next);

      // Assertions
      expect(next).toHaveBeenCalledWith(expect.any(ValidationError));
      expect(service.getResourceById).not.toHaveBeenCalled();
    });
  });

  describe('createResource', () => {
    it('should create a new resource', async () => {
      // Setup request body
      req.body = {
        name: 'New Resource',
        status: ResourceStatus.ACTIVE
      };

      // Setup service mock
      vi.mocked(service.createResource).mockResolvedValue(mockResource);

      // Call controller method
      await controller.createResource(req as Request, res as Response, next);

      // Assertions
      expect(service.createResource).toHaveBeenCalledWith(req.body);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(mockResource);
    });

    it('should handle errors', async () => {
      // Setup service to throw error
      const error = new Error('Creation error');
      vi.mocked(service.createResource).mockRejectedValue(error);

      // Call controller method
      await controller.createResource(req as Request, res as Response, next);

      // Assertions
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('updateResource', () => {
    it('should update an existing resource', async () => {
      // Setup request params and body
      req.params = { id: mockResource.id };
      req.body = {
        name: 'Updated Resource',
        description: 'Updated Description'
      };

      // Setup service mock
      const updatedResource: Resource = {
        ...mockResource,
        name: 'Updated Resource',
        description: 'Updated Description'
      };
      vi.mocked(service.updateResource).mockResolvedValue(updatedResource);

      // Call controller method
      await controller.updateResource(req as Request, res as Response, next);

      // Assertions
      expect(service.updateResource).toHaveBeenCalledWith(mockResource.id, req.body);
      expect(res.json).toHaveBeenCalledWith(updatedResource);
    });

    it('should throw ValidationError when id is missing', async () => {
      // Setup empty params (missing id)
      req.params = {};

      // Call controller method
      await controller.updateResource(req as Request, res as Response, next);

      // Assertions
      expect(next).toHaveBeenCalledWith(expect.any(ValidationError));
      expect(service.updateResource).not.toHaveBeenCalled();
    });

    it('should forward NotFoundError to next middleware', async () => {
      // Setup request params
      req.params = { id: 'non-existent-id' };

      // Setup service to throw NotFoundError
      const error = new NotFoundError('Resource', 'non-existent-id');
      vi.mocked(service.updateResource).mockRejectedValue(error);

      // Call controller method
      await controller.updateResource(req as Request, res as Response, next);

      // Assertions
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('deleteResource', () => {
    it('should delete an existing resource', async () => {
      // Setup request params
      req.params = { id: mockResource.id };

      // Setup service mock
      vi.mocked(service.deleteResource).mockResolvedValue(undefined);

      // Call controller method
      await controller.deleteResource(req as Request, res as Response, next);

      // Assertions
      expect(service.deleteResource).toHaveBeenCalledWith(mockResource.id);
      expect(res.status).toHaveBeenCalledWith(204);
      expect(res.end).toHaveBeenCalled();
    });

    it('should throw ValidationError when id is missing', async () => {
      // Setup empty params (missing id)
      req.params = {};

      // Call controller method
      await controller.deleteResource(req as Request, res as Response, next);

      // Assertions
      expect(next).toHaveBeenCalledWith(expect.any(ValidationError));
      expect(service.deleteResource).not.toHaveBeenCalled();
    });

    it('should forward NotFoundError to next middleware', async () => {
      // Setup request params
      req.params = { id: 'non-existent-id' };

      // Setup service to throw NotFoundError
      const error = new NotFoundError('Resource', 'non-existent-id');
      vi.mocked(service.deleteResource).mockRejectedValue(error);

      // Call controller method
      await controller.deleteResource(req as Request, res as Response, next);

      // Assertions
      expect(next).toHaveBeenCalledWith(error);
    });
  });
}); 