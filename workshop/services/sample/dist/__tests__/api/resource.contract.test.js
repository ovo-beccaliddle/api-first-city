import { describe, it, beforeAll, beforeEach, afterAll, expect } from 'vitest';
import request from 'supertest';
import { ResourceStatus } from '../../generated/types.gen';
import { ResourceRepository } from '../../repositories/resource-repository';
import { setupTestDatabase, clearTestData, teardownTestDatabase } from '../helpers/database';
import { createApp } from '../../app';
describe('Resource API Contract Tests', () => {
    let app;
    let resourceRepository;
    beforeAll(async () => {
        // Initialize test database before running tests
        const testDataSource = await setupTestDatabase();
        app = await createApp();
        resourceRepository = new ResourceRepository(testDataSource);
    });
    beforeEach(async () => {
        // Clear the database before each test
        await clearTestData();
    });
    afterAll(async () => {
        // Close database connection after all tests
        await teardownTestDatabase();
    });
    describe('GET /resources', () => {
        it('should return an empty list when no resources exist', async () => {
            const response = await request(app).get('/resources');
            expect(response.status).toBe(200);
            expect(response.body).toEqual({
                items: [],
                page: 1,
                page_size: 20,
                total: 0
            });
        });
        it('should return a list of resources when they exist', async () => {
            // Create test resources
            await resourceRepository.create({
                name: 'Test Resource 1',
                description: 'Test Description 1',
                status: ResourceStatus.ACTIVE
            });
            await resourceRepository.create({
                name: 'Test Resource 2',
                description: 'Test Description 2',
                status: ResourceStatus.PENDING
            });
            const response = await request(app).get('/resources');
            expect(response.status).toBe(200);
            expect(response.body).toMatchObject({
                items: expect.arrayContaining([
                    expect.objectContaining({
                        name: 'Test Resource 1',
                        description: 'Test Description 1',
                        status: ResourceStatus.ACTIVE
                    }),
                    expect.objectContaining({
                        name: 'Test Resource 2',
                        description: 'Test Description 2',
                        status: ResourceStatus.PENDING
                    })
                ]),
                page: 1,
                page_size: 20,
                total: 2
            });
        });
        it('should filter resources by name', async () => {
            // Create test resources
            await resourceRepository.create({
                name: 'Test Resource 1',
                description: 'Test Description 1',
                status: ResourceStatus.ACTIVE
            });
            await resourceRepository.create({
                name: 'Different Resource',
                description: 'Test Description 2',
                status: ResourceStatus.PENDING
            });
            const response = await request(app).get('/resources?name=Test');
            expect(response.status).toBe(200);
            expect(response.body).toMatchObject({
                items: [
                    expect.objectContaining({
                        name: 'Test Resource 1',
                        description: 'Test Description 1',
                        status: ResourceStatus.ACTIVE
                    })
                ],
                page: 1,
                page_size: 20,
                total: 1
            });
        });
        it('should handle pagination correctly', async () => {
            // Create test resources
            for (let i = 0; i < 25; i++) {
                await resourceRepository.create({
                    name: `Test Resource ${i + 1}`,
                    description: `Test Description ${i + 1}`,
                    status: ResourceStatus.ACTIVE
                });
            }
            const response = await request(app).get('/resources?page=2&page_size=10');
            expect(response.status).toBe(200);
            expect(response.body).toMatchObject({
                items: expect.arrayContaining(Array.from({ length: 10 }, (_, i) => expect.objectContaining({
                    name: `Test Resource ${i + 11}`,
                    description: `Test Description ${i + 11}`,
                    status: ResourceStatus.ACTIVE
                }))),
                page: 2,
                page_size: 10,
                total: 25
            });
        });
    });
    describe('GET /resources/:id', () => {
        it('should return 404 for non-existent resource', async () => {
            const response = await request(app).get('/resources/00000000-0000-0000-0000-000000000000');
            expect(response.status).toBe(404);
        });
        it('should return resource by id', async () => {
            const resource = await resourceRepository.create({
                name: 'Test Resource',
                description: 'Test Description',
                status: ResourceStatus.ACTIVE
            });
            const response = await request(app).get(`/resources/${resource.id}`);
            expect(response.status).toBe(200);
            expect(response.body).toMatchObject({
                id: resource.id,
                name: 'Test Resource',
                description: 'Test Description',
                status: ResourceStatus.ACTIVE
            });
        });
    });
    describe('POST /resources', () => {
        it('should create resource with required fields only', async () => {
            const response = await request(app)
                .post('/resources')
                .send({
                name: 'Test Resource',
                status: ResourceStatus.ACTIVE
            });
            expect(response.status).toBe(201);
            expect(response.body).toMatchObject({
                name: 'Test Resource',
                status: ResourceStatus.ACTIVE
            });
        });
        it('should create resource with all fields', async () => {
            const response = await request(app)
                .post('/resources')
                .send({
                name: 'Test Resource',
                description: 'Test Description',
                status: ResourceStatus.ACTIVE,
                tags: ['test', 'example']
            });
            expect(response.status).toBe(201);
            expect(response.body).toMatchObject({
                name: 'Test Resource',
                description: 'Test Description',
                status: ResourceStatus.ACTIVE,
                tags: ['test', 'example']
            });
        });
        it('should return 400 for invalid resource data', async () => {
            const response = await request(app)
                .post('/resources')
                .send({
                description: 'Test Description',
                status: ResourceStatus.ACTIVE
            });
            expect(response.status).toBe(400);
        });
    });
    describe('PUT /resources/:id', () => {
        it('should return 404 when updating non-existent resource', async () => {
            const response = await request(app)
                .put('/resources/00000000-0000-0000-0000-000000000000')
                .send({
                name: 'Updated Resource',
                status: ResourceStatus.ACTIVE
            });
            expect(response.status).toBe(404);
        });
        it('should update resource fields', async () => {
            const resource = await resourceRepository.create({
                name: 'Test Resource',
                description: 'Test Description',
                status: ResourceStatus.ACTIVE
            });
            const response = await request(app)
                .put(`/resources/${resource.id}`)
                .send({
                name: 'Updated Resource',
                description: 'Updated Description',
                status: ResourceStatus.INACTIVE
            });
            expect(response.status).toBe(200);
            expect(response.body).toMatchObject({
                id: resource.id,
                name: 'Updated Resource',
                description: 'Updated Description',
                status: ResourceStatus.INACTIVE
            });
        });
    });
    describe('DELETE /resources/:id', () => {
        it('should return 404 when deleting non-existent resource', async () => {
            const response = await request(app).delete('/resources/00000000-0000-0000-0000-000000000000');
            expect(response.status).toBe(404);
        });
        it('should delete existing resource', async () => {
            const resource = await resourceRepository.create({
                name: 'Test Resource',
                description: 'Test Description',
                status: ResourceStatus.ACTIVE
            });
            const response = await request(app).delete(`/resources/${resource.id}`);
            expect(response.status).toBe(204);
            const deletedResource = await resourceRepository.findById(resource.id);
            expect(deletedResource).toBeNull();
        });
    });
});
