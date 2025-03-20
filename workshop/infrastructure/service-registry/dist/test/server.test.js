"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const vitest_1 = require("vitest");
// Mock the common module
vitest_1.vi.mock('@city-services/common', () => {
    return {
        errorHandler: vitest_1.vi.fn((err, req, res, next) => next(err)),
        requestLogger: vitest_1.vi.fn(() => (req, res, next) => next()),
    };
});
(0, vitest_1.describe)('Service Registry Server', () => {
    let app;
    (0, vitest_1.beforeAll)(async () => {
        // Clear module cache to ensure a fresh server instance
        vitest_1.vi.resetModules();
        // Set up test environment variables if needed
        process.env.PORT = '3001';
        // Import the server module directly
        const { app: expressApp } = await Promise.resolve().then(() => __importStar(require('../src/server')));
        app = expressApp;
    });
    (0, vitest_1.describe)('Health Check Endpoint', () => {
        (0, vitest_1.it)('should return 200 OK status with correct response', async () => {
            const response = await (0, supertest_1.default)(app).get('/health');
            (0, vitest_1.expect)(response.status).toBe(200);
            (0, vitest_1.expect)(response.body).toHaveProperty('status', 'ok');
            (0, vitest_1.expect)(response.body).toHaveProperty('version');
            (0, vitest_1.expect)(response.body).toHaveProperty('timestamp');
            (0, vitest_1.expect)(response.body).toHaveProperty('services');
        });
    });
    (0, vitest_1.describe)('Service Registration', () => {
        const testService = {
            name: 'test-service',
            url: 'http://test-service:8080',
            healthCheckUrl: 'http://test-service:8080/health',
            metadata: { version: '1.0.0' },
        };
        afterEach(async () => {
            // Clean up registered service
            try {
                await (0, supertest_1.default)(app).delete(`/services/${testService.name}`);
            }
            catch (e) {
                // Ignore cleanup errors
            }
        });
        (0, vitest_1.it)('should register a new service', async () => {
            const response = await (0, supertest_1.default)(app).post('/register').send(testService);
            (0, vitest_1.expect)(response.status).toBe(201);
            (0, vitest_1.expect)(response.body).toHaveProperty('status', 'registered');
        });
        (0, vitest_1.it)('should require service name and URL', async () => {
            const response = await (0, supertest_1.default)(app).post('/register').send({ name: 'incomplete-service' });
            (0, vitest_1.expect)(response.status).toBe(400);
            (0, vitest_1.expect)(response.body).toHaveProperty('error', 'bad_request');
        });
        (0, vitest_1.it)('should retrieve a registered service', async () => {
            // First, register a service
            await (0, supertest_1.default)(app).post('/register').send(testService);
            // Then retrieve it
            const response = await (0, supertest_1.default)(app).get(`/services/${testService.name}`);
            (0, vitest_1.expect)(response.status).toBe(200);
            (0, vitest_1.expect)(response.body).toHaveProperty('url', testService.url);
            (0, vitest_1.expect)(response.body).toHaveProperty('healthCheckUrl', testService.healthCheckUrl);
            (0, vitest_1.expect)(response.body).toHaveProperty('lastHeartbeat');
            (0, vitest_1.expect)(response.body.metadata).toEqual(testService.metadata);
        });
        (0, vitest_1.it)('should return 404 for non-existent service', async () => {
            const response = await (0, supertest_1.default)(app).get('/services/non-existent-service');
            (0, vitest_1.expect)(response.status).toBe(404);
            (0, vitest_1.expect)(response.body).toHaveProperty('error', 'not_found');
        });
        (0, vitest_1.it)('should list all registered services', async () => {
            // Register a service if not already registered
            await (0, supertest_1.default)(app).post('/register').send(testService);
            const response = await (0, supertest_1.default)(app).get('/services');
            (0, vitest_1.expect)(response.status).toBe(200);
            (0, vitest_1.expect)(response.body).toBeTypeOf('object');
            (0, vitest_1.expect)(response.body).toHaveProperty(testService.name);
        });
    });
    (0, vitest_1.describe)('Service Updates', () => {
        const testService = {
            name: 'update-test-service',
            url: 'http://test-service:8080',
            healthCheckUrl: 'http://test-service:8080/health',
            metadata: { version: '1.0.0' },
        };
        (0, vitest_1.beforeEach)(async () => {
            // Register a fresh service for each test
            await (0, supertest_1.default)(app).post('/register').send(testService);
        });
        afterEach(async () => {
            // Clean up registered service
            try {
                await (0, supertest_1.default)(app).delete(`/services/${testService.name}`);
            }
            catch (e) {
                // Ignore cleanup errors
            }
        });
        (0, vitest_1.it)('should update an existing service', async () => {
            const updatedData = {
                url: 'http://updated-service:9000',
                healthCheckUrl: 'http://test-service:8080/health',
                metadata: { version: '2.0.0' },
            };
            const response = await (0, supertest_1.default)(app).put(`/services/${testService.name}`).send(updatedData);
            (0, vitest_1.expect)(response.status).toBe(200);
            (0, vitest_1.expect)(response.body).toHaveProperty('status', 'updated');
            // Verify the update
            const getResponse = await (0, supertest_1.default)(app).get(`/services/${testService.name}`);
            (0, vitest_1.expect)(getResponse.body.url).toBe(updatedData.url);
            (0, vitest_1.expect)(getResponse.body.metadata).toEqual(updatedData.metadata);
            (0, vitest_1.expect)(getResponse.body.healthCheckUrl).toBe(updatedData.healthCheckUrl);
        });
        (0, vitest_1.it)('should return 404 when updating non-existent service', async () => {
            const response = await (0, supertest_1.default)(app)
                .put('/services/non-existent-service')
                .send({ url: 'http://new-url:8080' });
            (0, vitest_1.expect)(response.status).toBe(404);
            (0, vitest_1.expect)(response.body).toHaveProperty('error', 'not_found');
        });
    });
    (0, vitest_1.describe)('Heartbeat Management', () => {
        const testService = {
            name: 'heartbeat-test-service',
            url: 'http://test-service:8080',
        };
        (0, vitest_1.beforeEach)(async () => {
            // Register a service for heartbeat tests
            await (0, supertest_1.default)(app).post('/register').send(testService);
        });
        afterEach(async () => {
            // Clean up registered service
            try {
                await (0, supertest_1.default)(app).delete(`/services/${testService.name}`);
            }
            catch (e) {
                // Ignore cleanup errors
            }
        });
        (0, vitest_1.it)('should record a heartbeat for a registered service', async () => {
            const response = await (0, supertest_1.default)(app).post(`/heartbeat/${testService.name}`);
            (0, vitest_1.expect)(response.status).toBe(200);
            (0, vitest_1.expect)(response.body).toHaveProperty('status', 'ok');
            // Verify the service still exists
            const getResponse = await (0, supertest_1.default)(app).get(`/services/${testService.name}`);
            (0, vitest_1.expect)(getResponse.status).toBe(200);
        });
        (0, vitest_1.it)('should return 404 for heartbeat to non-existent service', async () => {
            const response = await (0, supertest_1.default)(app).post('/heartbeat/non-existent-service');
            (0, vitest_1.expect)(response.status).toBe(404);
            (0, vitest_1.expect)(response.body).toHaveProperty('error', 'not_found');
        });
    });
    (0, vitest_1.describe)('Service Deletion', () => {
        const testService = {
            name: 'delete-test-service',
            url: 'http://test-service:8080',
        };
        (0, vitest_1.beforeEach)(async () => {
            // Register a fresh service for each test
            await (0, supertest_1.default)(app).post('/register').send(testService);
        });
        (0, vitest_1.it)('should delete a registered service', async () => {
            const response = await (0, supertest_1.default)(app).delete(`/services/${testService.name}`);
            (0, vitest_1.expect)(response.status).toBe(200);
            (0, vitest_1.expect)(response.body).toHaveProperty('status', 'deleted');
            // Verify the service is gone
            const getResponse = await (0, supertest_1.default)(app).get(`/services/${testService.name}`);
            (0, vitest_1.expect)(getResponse.status).toBe(404);
        });
        (0, vitest_1.it)('should return 404 when deleting non-existent service', async () => {
            // First delete the service
            await (0, supertest_1.default)(app).delete(`/services/${testService.name}`);
            // Try to delete it again
            const response = await (0, supertest_1.default)(app).delete(`/services/${testService.name}`);
            (0, vitest_1.expect)(response.status).toBe(404);
            (0, vitest_1.expect)(response.body).toHaveProperty('error', 'not_found');
        });
    });
});
//# sourceMappingURL=server.test.js.map