import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ResourceService } from '../../services/resource-service';
import { ResourceRepository } from '../../repositories/resource-repository';
import { NotFoundError } from '@city-services/common';
import { ResourceStatus, Resource, ResourceList } from '../../generated/types.gen';

// Mock the ResourceRepository
vi.mock('../../repositories/resource-repository', () => {
  return {
    ResourceRepository: vi.fn().mockImplementation(() => ({
      findAll: vi.fn(),
      findById: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn()
    }))
  };
});

describe('ResourceService', () => {
  let service: ResourceService;
  let repository: ResourceRepository;

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
    // Create a fresh mock for each test
    repository = new ResourceRepository();
    service = new ResourceService(repository);
  });

  describe('getResources', () => {
    it('should retrieve resources with default options', async () => {
      // Setup the mock
      vi.mocked(repository.findAll).mockResolvedValue(mockResourceList);

      // Call the method
      const result = await service.getResources();

      // Assertions
      expect(repository.findAll).toHaveBeenCalledWith(undefined);
      expect(result).toEqual(mockResourceList);
    });

    it('should retrieve resources with provided options', async () => {
      // Options to pass
      const options = { name: 'Test', page: 2, page_size: 10 };
      
      // Setup the mock
      vi.mocked(repository.findAll).mockResolvedValue({
        ...mockResourceList,
        page: 2,
        page_size: 10
      });

      // Call the method
      const result = await service.getResources(options);

      // Assertions
      expect(repository.findAll).toHaveBeenCalledWith(options);
      expect(result.page).toBe(2);
      expect(result.page_size).toBe(10);
    });
  });

  describe('getResourceById', () => {
    it('should return a resource when it exists', async () => {
      // Setup the mock
      vi.mocked(repository.findById).mockResolvedValue(mockResource);

      // Call the method
      const result = await service.getResourceById(mockResource.id);

      // Assertions
      expect(repository.findById).toHaveBeenCalledWith(mockResource.id);
      expect(result).toEqual(mockResource);
    });

    it('should throw NotFoundError when resource does not exist', async () => {
      // Setup the mock to return null (not found)
      vi.mocked(repository.findById).mockResolvedValue(null);

      // Call the method and expect error
      await expect(service.getResourceById('non-existent-id'))
        .rejects.toThrow(NotFoundError);
      
      expect(repository.findById).toHaveBeenCalledWith('non-existent-id');
    });
  });

  describe('createResource', () => {
    it('should create a new resource', async () => {
      // Resource data to create
      const createData = {
        name: 'New Resource',
        status: ResourceStatus.ACTIVE
      };

      // Setup the mock
      const newResource: Resource = {
        ...mockResource,
        name: 'New Resource'
      };
      vi.mocked(repository.create).mockResolvedValue(newResource);

      // Call the method
      const result = await service.createResource(createData);

      // Assertions
      expect(repository.create).toHaveBeenCalledWith(createData);
      expect(result.name).toBe('New Resource');
    });
  });

  describe('updateResource', () => {
    it('should update an existing resource', async () => {
      // Update data
      const updateData = {
        name: 'Updated Resource',
        description: 'Updated Description'
      };

      // Setup the mock
      const updatedResource: Resource = {
        ...mockResource,
        name: 'Updated Resource',
        description: 'Updated Description'
      };
      vi.mocked(repository.update).mockResolvedValue(updatedResource);

      // Call the method
      const result = await service.updateResource(mockResource.id, updateData);

      // Assertions
      expect(repository.update).toHaveBeenCalledWith(mockResource.id, updateData);
      expect(result.name).toBe('Updated Resource');
      expect(result.description).toBe('Updated Description');
    });

    it('should throw NotFoundError when updating non-existent resource', async () => {
      // Setup the mock to return null (not found)
      vi.mocked(repository.update).mockResolvedValue(null);

      // Call the method and expect error
      await expect(service.updateResource('non-existent-id', { name: 'Test' }))
        .rejects.toThrow(NotFoundError);
      
      expect(repository.update).toHaveBeenCalledWith('non-existent-id', { name: 'Test' });
    });
  });

  describe('deleteResource', () => {
    it('should delete an existing resource', async () => {
      // Setup the mock to return true (successful deletion)
      vi.mocked(repository.delete).mockResolvedValue(true);

      // Call the method
      await service.deleteResource(mockResource.id);

      // Assertions
      expect(repository.delete).toHaveBeenCalledWith(mockResource.id);
    });

    it('should throw NotFoundError when deleting non-existent resource', async () => {
      // Setup the mock to return false (not found)
      vi.mocked(repository.delete).mockResolvedValue(false);

      // Call the method and expect error
      await expect(service.deleteResource('non-existent-id'))
        .rejects.toThrow(NotFoundError);
      
      expect(repository.delete).toHaveBeenCalledWith('non-existent-id');
    });
  });
}); 