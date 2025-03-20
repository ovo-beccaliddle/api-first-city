import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ResourceRepository } from '../../repositories/resource-repository';
import { DataSource, Repository } from 'typeorm';
import { ResourceEntity } from '../../models/resource.entity';
import { ResourceStatus, Resource } from '../../generated/types.gen';

describe('ResourceRepository Unit Tests', () => {
  let repository: ResourceRepository;
  let mockDataSource: any;
  let mockTypeOrmRepository: any;
  let mockQueryBuilder: any;

  const sampleUuid = '123e4567-e89b-12d3-a456-426614174000';
  
  // Create sample entity data
  const resourceEntity: ResourceEntity = {
    id: sampleUuid,
    name: 'Test Resource',
    description: 'Test Description',
    status: ResourceStatus.ACTIVE,
    tags: ['test', 'sample'],
    createdAt: new Date(),
    updatedAt: new Date()
  };

  // Create sample resource data (API model)
  const resource: Resource = {
    id: resourceEntity.id,
    name: resourceEntity.name,
    description: resourceEntity.description,
    status: resourceEntity.status,
    tags: resourceEntity.tags,
    createdAt: resourceEntity.createdAt,
    updatedAt: resourceEntity.updatedAt
  };

  beforeEach(() => {
    // Mock QueryBuilder
    mockQueryBuilder = {
      where: vi.fn().mockReturnThis(),
      andWhere: vi.fn().mockReturnThis(),
      skip: vi.fn().mockReturnThis(),
      take: vi.fn().mockReturnThis(),
      getMany: vi.fn(),
      getManyAndCount: vi.fn(),
      getCount: vi.fn(),
      getOne: vi.fn(),
      execute: vi.fn(),
      orderBy: vi.fn().mockReturnThis()
    };

    // Mock Repository
    mockTypeOrmRepository = {
      createQueryBuilder: vi.fn().mockReturnValue(mockQueryBuilder),
      findOne: vi.fn(),
      findOneBy: vi.fn(),
      save: vi.fn(),
      create: vi.fn(),
      delete: vi.fn(),
      merge: vi.fn()
    };

    // Mock DataSource
    mockDataSource = {
      getRepository: vi.fn().mockReturnValue(mockTypeOrmRepository)
    };

    // Create repository instance with mocked dependencies
    repository = new ResourceRepository(mockDataSource as any);
  });

  describe('findAll', () => {
    it('should return empty list when no resources exist', async () => {
      // Mock empty result
      mockQueryBuilder.getMany.mockResolvedValue([]);
      mockQueryBuilder.getCount.mockResolvedValue(0);

      // Call method
      const result = await repository.findAll();

      // Assertions
      expect(mockDataSource.getRepository).toHaveBeenCalledWith(ResourceEntity);
      expect(mockTypeOrmRepository.createQueryBuilder).toHaveBeenCalledWith('resource');
      expect(result.items).toHaveLength(0);
      expect(result.total).toBe(0);
      expect(result.page).toBe(1);
      expect(result.page_size).toBe(20);
    });

    it('should filter resources by name', async () => {
      // Mock result with one entity
      mockQueryBuilder.getMany.mockResolvedValue([resourceEntity]);
      mockQueryBuilder.getCount.mockResolvedValue(1);
      
      // Important: mock where instead of andWhere for the first condition
      mockQueryBuilder.where.mockReturnThis();

      // Call method with name filter
      const result = await repository.findAll({ name: 'Test' });

      // Assertions
      expect(mockQueryBuilder.where).toHaveBeenCalledWith('resource.name ILIKE :name', { name: '%Test%' });
      expect(result.items).toHaveLength(1);
      expect(result.items[0].name).toBe('Test Resource');
    });

    it('should paginate results', async () => {
      // Mock result
      mockQueryBuilder.getMany.mockResolvedValue([resourceEntity]);
      mockQueryBuilder.getCount.mockResolvedValue(10);

      // Call method with pagination
      const result = await repository.findAll({ page: 2, page_size: 5 });

      // Assertions
      expect(mockQueryBuilder.skip).toHaveBeenCalledWith(5);
      expect(mockQueryBuilder.take).toHaveBeenCalledWith(5);
      expect(result.page).toBe(2);
      expect(result.page_size).toBe(5);
      expect(result.total).toBe(10);
    });
  });

  describe('findById', () => {
    it('should return a resource when it exists', async () => {
      // Mock repository to return the entity
      mockTypeOrmRepository.findOneBy.mockResolvedValue(resourceEntity);

      // Call method
      const result = await repository.findById(sampleUuid);

      // Assertions
      expect(mockTypeOrmRepository.findOneBy).toHaveBeenCalledWith({ id: sampleUuid });
      expect(result).toEqual(resource);
    });

    it('should return null when resource does not exist', async () => {
      // Mock repository to return null
      mockTypeOrmRepository.findOneBy.mockResolvedValue(null);

      // Call method
      const result = await repository.findById('non-existent-id');

      // Assertions
      expect(mockTypeOrmRepository.findOneBy).toHaveBeenCalledWith({ id: 'non-existent-id' });
      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('should create and return a new resource', async () => {
      // Create data for new resource
      const createData = {
        name: 'New Resource',
        status: ResourceStatus.ACTIVE
      };

      // Mock TypeORM create and save
      const newEntity = {
        ...resourceEntity,
        name: 'New Resource',
        id: 'new-id'
      };
      
      mockTypeOrmRepository.create.mockReturnValue(newEntity);
      mockTypeOrmRepository.save.mockResolvedValue(newEntity);

      // Call method
      const result = await repository.create(createData);

      // Assertions
      expect(mockTypeOrmRepository.create).toHaveBeenCalled();
      expect(mockTypeOrmRepository.save).toHaveBeenCalled();
      expect(result.name).toBe('New Resource');
      expect(result.id).toBe('new-id');
    });
  });

  describe('update', () => {
    it('should update and return an existing resource', async () => {
      // Update data
      const updateData = {
        name: 'Updated Resource',
        description: 'Updated Description'
      };

      // Mock findOne instead of findOneBy - this matches the actual implementation
      mockTypeOrmRepository.findOne.mockResolvedValue(resourceEntity);

      // Mock merge to return merged entity
      const mergedEntity = {
        ...resourceEntity,
        ...updateData,
        updatedAt: new Date()
      };
      mockTypeOrmRepository.merge.mockReturnValue(mergedEntity);

      // Mock save to return updated entity
      mockTypeOrmRepository.save.mockResolvedValue(mergedEntity);

      // Call method
      const result = await repository.update(sampleUuid, updateData);

      // Assertions - check if findOne was called with correct params
      expect(mockTypeOrmRepository.findOne).toHaveBeenCalledWith({ where: { id: sampleUuid } });
      expect(mockTypeOrmRepository.merge).toHaveBeenCalled();
      expect(mockTypeOrmRepository.save).toHaveBeenCalled();
      expect(result?.name).toBe('Updated Resource');
      expect(result?.description).toBe('Updated Description');
    });

    it('should return null when updating non-existent resource', async () => {
      // Mock findOne to return null (not found)
      mockTypeOrmRepository.findOne.mockResolvedValue(null);

      // Call method
      const result = await repository.update('non-existent-id', { name: 'Test' });

      // Assertions
      expect(mockTypeOrmRepository.findOne).toHaveBeenCalledWith({ where: { id: 'non-existent-id' } });
      expect(mockTypeOrmRepository.save).not.toHaveBeenCalled();
      expect(result).toBeNull();
    });
  });

  describe('delete', () => {
    it('should delete an existing resource and return true', async () => {
      // No need to mock findOneBy for delete based on the implementation
      
      // Mock delete to indicate success (affected rows > 0)
      mockTypeOrmRepository.delete.mockResolvedValue({ affected: 1, raw: {} });

      // Call method
      const result = await repository.delete(sampleUuid);

      // Assertions
      expect(mockTypeOrmRepository.delete).toHaveBeenCalledWith(sampleUuid);
      expect(result).toBe(true);
    });

    it('should return false when deleting non-existent resource', async () => {
      // Mock delete to indicate not found (affected rows = 0)
      mockTypeOrmRepository.delete.mockResolvedValue({ affected: 0, raw: {} });

      // Call method
      const result = await repository.delete('non-existent-id');

      // Assertions
      expect(mockTypeOrmRepository.delete).toHaveBeenCalledWith('non-existent-id');
      expect(result).toBe(false);
    });

    it('should return false when delete operation fails', async () => {
      // Mock delete to indicate failure (affected rows = 0)
      mockTypeOrmRepository.delete.mockResolvedValue({ affected: 0, raw: {} });

      // Call method
      const result = await repository.delete(sampleUuid);

      // Assertions
      expect(mockTypeOrmRepository.delete).toHaveBeenCalledWith(sampleUuid);
      expect(result).toBe(false);
    });
  });
}); 