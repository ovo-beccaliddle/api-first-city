import { describe, it, beforeAll, beforeEach, afterAll, expect } from 'vitest';
import { ResourceRepository } from '../../repositories/resource-repository';
import { ResourceEntity } from '../../models/resource.entity';
import { ResourceStatus } from '../../generated/types.gen';
import { setupTestDatabase, teardownTestDatabase, clearTestData } from '../helpers/database';

describe('ResourceRepository Integration Tests', () => {
  let repository: ResourceRepository;
  const NON_EXISTENT_UUID = '00000000-0000-0000-0000-000000000000';

  beforeAll(async () => {
    const dataSource = await setupTestDatabase();
    repository = new ResourceRepository(dataSource);
  });

  beforeEach(async () => {
    await clearTestData();
  });

  afterAll(async () => {
    await teardownTestDatabase();
  });

  describe('findAll', () => {
    it('should return empty list when no resources exist', async () => {
      const result = await repository.findAll();
      expect(result.items).toHaveLength(0);
      expect(result.total).toBe(0);
    });

    it('should return all resources with default pagination', async () => {
      // Create test resources
      await repository.create({
        name: 'Test Resource 1',
        description: 'Description 1',
        status: ResourceStatus.ACTIVE
      });
      await repository.create({
        name: 'Test Resource 2',
        description: 'Description 2',
        status: ResourceStatus.INACTIVE
      });

      const result = await repository.findAll();
      expect(result.items).toHaveLength(2);
      expect(result.total).toBe(2);
      expect(result.page).toBe(1);
      expect(result.page_size).toBe(20);
    });

    it('should filter resources by name', async () => {
      await repository.create({
        name: 'Test Resource',
        status: ResourceStatus.ACTIVE
      });
      await repository.create({
        name: 'Different Name',
        status: ResourceStatus.ACTIVE
      });

      const result = await repository.findAll({ name: 'Test' });
      expect(result.items).toHaveLength(1);
      expect(result.items[0].name).toBe('Test Resource');
    });

    it('should handle pagination correctly', async () => {
      // Create 25 resources
      for (let i = 0; i < 25; i++) {
        await repository.create({
          name: `Resource ${i + 1}`,
          status: ResourceStatus.ACTIVE
        });
      }

      const page2 = await repository.findAll({ page: 2, page_size: 10 });
      expect(page2.items).toHaveLength(10);
      expect(page2.total).toBe(25);
      expect(page2.page).toBe(2);
      expect(page2.page_size).toBe(10);
    });
  });

  describe('findById', () => {
    it('should return null for non-existent resource', async () => {
      const result = await repository.findById(NON_EXISTENT_UUID);
      expect(result).toBeNull();
    });

    it('should return resource by id', async () => {
      const created = await repository.create({
        name: 'Test Resource',
        description: 'Test Description',
        status: ResourceStatus.ACTIVE
      });

      const result = await repository.findById(created.id);
      expect(result).toMatchObject({
        id: created.id,
        name: 'Test Resource',
        description: 'Test Description',
        status: ResourceStatus.ACTIVE
      });
    });
  });

  describe('create', () => {
    it('should create resource with required fields only', async () => {
      const result = await repository.create({
        name: 'Minimal Resource',
        status: ResourceStatus.ACTIVE
      });

      expect(result).toMatchObject({
        name: 'Minimal Resource',
        status: ResourceStatus.ACTIVE
      });
      expect(result.id).toBeDefined();
      expect(result.createdAt).toBeInstanceOf(Date);
      expect(result.updatedAt).toBeInstanceOf(Date);
    });

    it('should create resource with all fields', async () => {
      const result = await repository.create({
        name: 'Full Resource',
        description: 'Full Description',
        status: ResourceStatus.ACTIVE,
        tags: ['tag1', 'tag2']
      });

      expect(result).toMatchObject({
        name: 'Full Resource',
        description: 'Full Description',
        status: ResourceStatus.ACTIVE,
        tags: ['tag1', 'tag2']
      });
    });
  });

  describe('update', () => {
    it('should return null when updating non-existent resource', async () => {
      const result = await repository.update(NON_EXISTENT_UUID, {
        name: 'Updated Name'
      });
      expect(result).toBeNull();
    });

    it('should update resource fields', async () => {
      const created = await repository.create({
        name: 'Original Name',
        description: 'Original Description',
        status: ResourceStatus.ACTIVE,
        tags: ['original']
      });

      const result = await repository.update(created.id, {
        name: 'Updated Name',
        description: 'Updated Description',
        status: ResourceStatus.INACTIVE,
        tags: ['updated']
      });

      expect(result).toMatchObject({
        id: created.id,
        name: 'Updated Name',
        description: 'Updated Description',
        status: ResourceStatus.INACTIVE,
        tags: ['updated']
      });
      expect(new Date(result!.updatedAt).getTime()).toBeGreaterThan(
        new Date(created.updatedAt).getTime()
      );
    });

    it('should only update provided fields', async () => {
      const created = await repository.create({
        name: 'Original Name',
        description: 'Original Description',
        status: ResourceStatus.ACTIVE
      });

      const result = await repository.update(created.id, {
        name: 'Updated Name'
      });

      expect(result).toMatchObject({
        id: created.id,
        name: 'Updated Name',
        description: 'Original Description',
        status: ResourceStatus.ACTIVE
      });
    });
  });

  describe('delete', () => {
    it('should return false when deleting non-existent resource', async () => {
      const result = await repository.delete(NON_EXISTENT_UUID);
      expect(result).toBe(false);
    });

    it('should delete existing resource', async () => {
      const created = await repository.create({
        name: 'To Delete',
        status: ResourceStatus.ACTIVE
      });

      const deleteResult = await repository.delete(created.id);
      expect(deleteResult).toBe(true);

      const findResult = await repository.findById(created.id);
      expect(findResult).toBeNull();
    });
  });
}); 