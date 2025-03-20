import { describe, it, beforeAll, beforeEach, afterAll, expect } from 'vitest';
import { ResourceRepository } from '../../repositories/resource-repository';
import { ResourceStatus } from '../../generated/types.gen';
import { setupTestDatabase, teardownTestDatabase, clearTestData } from '../helpers/database';
describe('ResourceRepository Transaction Tests', () => {
    let repository;
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
    it('should rollback changes when transaction fails', async () => {
        const resource = await repository.create({
            name: 'Test Resource',
            status: ResourceStatus.ACTIVE,
            tags: []
        });
        try {
            await repository.transaction(async (repo) => {
                await repo.update(resource.id, { name: 'Updated Name' });
                throw new Error('Simulated error');
            });
        }
        catch (error) {
            // Expected error
        }
        const unchanged = await repository.findById(resource.id);
        expect(unchanged?.name).toBe('Test Resource');
    });
    it('should commit changes when transaction succeeds', async () => {
        const resource = await repository.create({
            name: 'Test Resource',
            status: ResourceStatus.ACTIVE,
            tags: []
        });
        await repository.transaction(async (repo) => {
            await repo.update(resource.id, { name: 'Updated Name' });
        });
        const changed = await repository.findById(resource.id);
        expect(changed?.name).toBe('Updated Name');
    });
    it('should handle nested transactions', async () => {
        const resource = await repository.create({
            name: 'Test Resource',
            status: ResourceStatus.ACTIVE,
            tags: []
        });
        try {
            await repository.transaction(async (repo1) => {
                await repo1.update(resource.id, { name: 'First Update' });
                await repository.transaction(async (repo2) => {
                    await repo2.update(resource.id, { name: 'Second Update' });
                    throw new Error('Simulated error in nested transaction');
                });
            });
        }
        catch (error) {
            // Expected error
        }
        const unchanged = await repository.findById(resource.id);
        expect(unchanged?.name).toBe('Test Resource');
    });
});
