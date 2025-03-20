import { describe, it, beforeAll, beforeEach, afterAll, expect } from 'vitest';
import config from '../../config';
import { initializeConfig } from '../../config';
import nock from 'nock';
import { ServiceRegistryClient } from '@city-services/service-registry';
describe('Service Registry Integration Tests', () => {
    let serviceRegistry;
    beforeAll(async () => {
        // Initialize configuration
        await initializeConfig();
        serviceRegistry = new ServiceRegistryClient({
            serviceName: config.serviceName,
            serviceUrl: `http://localhost:${config.port}`,
            registryUrl: config.serviceRegistry.url
        });
    });
    beforeEach(() => {
        // Clear all nock interceptors
        nock.cleanAll();
    });
    afterAll(() => {
        nock.restore();
    });
    describe('service registration', () => {
        it('should register service successfully', async () => {
            // Mock service registry endpoint
            nock(config.serviceRegistry.url)
                .post('/register')
                .reply(201, {
                status: 'registered',
                timestamp: new Date().toISOString()
            });
            const result = await serviceRegistry.register();
            expect(result).toBe(true);
        });
        it('should handle registration failure', async () => {
            // Mock service registry endpoint with error
            nock(config.serviceRegistry.url)
                .post('/register')
                .reply(500, { error: 'Internal Server Error' });
            const result = await serviceRegistry.register();
            expect(result).toBe(false);
        });
    });
    describe('service discovery', () => {
        it('should discover other services', async () => {
            const mockService = {
                url: 'http://localhost:4001',
                healthCheckUrl: 'http://localhost:4001/health',
                metadata: {},
                lastHeartbeat: Date.now()
            };
            // Mock service registry discovery endpoint
            nock(config.serviceRegistry.url)
                .get('/services/iam-service')
                .reply(200, mockService);
            const service = await serviceRegistry.discover('iam-service');
            expect(service).toBeDefined();
            expect(service?.url).toBe('http://localhost:4001');
        });
        it('should handle empty service discovery result', async () => {
            // Mock service registry discovery endpoint with 404
            nock(config.serviceRegistry.url)
                .get('/services/non-existent')
                .reply(404, {
                error: 'not_found',
                message: 'Service not found'
            });
            const service = await serviceRegistry.discover('non-existent');
            expect(service).toBeNull();
        });
        it('should handle service discovery failure', async () => {
            // Mock service registry discovery endpoint with error
            nock(config.serviceRegistry.url)
                .get('/services/iam-service')
                .reply(500, { error: 'Internal Server Error' });
            const service = await serviceRegistry.discover('iam-service');
            expect(service).toBeNull();
        });
    });
    describe('service listing', () => {
        it('should list all services', async () => {
            const mockServices = {
                'iam-service': {
                    url: 'http://localhost:4001',
                    healthCheckUrl: 'http://localhost:4001/health',
                    metadata: {},
                    lastHeartbeat: Date.now()
                }
            };
            // Mock service registry list endpoint
            nock(config.serviceRegistry.url)
                .get('/services')
                .reply(200, mockServices);
            const services = await serviceRegistry.listAll();
            expect(services).toBeDefined();
            expect(services['iam-service']).toBeDefined();
            expect(services['iam-service'].url).toBe('http://localhost:4001');
        });
        it('should handle empty service list', async () => {
            // Mock service registry list endpoint with empty result
            nock(config.serviceRegistry.url)
                .get('/services')
                .reply(200, {});
            const services = await serviceRegistry.listAll();
            expect(Object.keys(services)).toHaveLength(0);
        });
    });
    describe('service deregistration', () => {
        it('should unregister service successfully', async () => {
            // Mock service registry unregister endpoint
            nock(config.serviceRegistry.url)
                .delete(`/services/${config.serviceName}`)
                .reply(200, {
                status: 'deleted',
                timestamp: new Date().toISOString()
            });
            const result = await serviceRegistry.unregister();
            expect(result).toBe(true);
        });
        it('should handle unregistration failure', async () => {
            // Register the service first
            nock(config.serviceRegistry.url)
                .post('/register')
                .reply(201, {
                status: 'registered',
                timestamp: new Date().toISOString()
            });
            await serviceRegistry.register();
            // Mock service registry unregister endpoint with error
            nock(config.serviceRegistry.url)
                .delete(`/services/${config.serviceName}`)
                .reply(500, { error: 'Internal Server Error' });
            const result = await serviceRegistry.unregister();
            expect(result).toBe(false);
        });
    });
});
