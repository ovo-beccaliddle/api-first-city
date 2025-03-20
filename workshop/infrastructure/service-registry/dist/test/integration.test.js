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
const client_1 = require("../src/client");
// Mock fetch for client tests
const originalFetch = global.fetch;
(0, vitest_1.describe)('Service Registry Integration', () => {
    let app;
    let registry;
    let mockFetch;
    (0, vitest_1.beforeAll)(async () => {
        // Clear module cache to ensure a fresh server instance
        vitest_1.vi.resetModules();
        // Set up test environment variables
        process.env.PORT = '3002'; // Different port from server tests
        // Import the server directly
        const serverModule = await Promise.resolve().then(() => __importStar(require('../src/server')));
        app = serverModule.app;
        registry = serverModule.registry;
        // Set up fetch mock for client tests
        mockFetch = vitest_1.vi.fn();
        global.fetch = mockFetch;
    });
    (0, vitest_1.afterAll)(() => {
        // Restore original fetch
        global.fetch = originalFetch;
    });
    (0, vitest_1.beforeEach)(() => {
        // Clear registry before each test
        for (const serviceName of Object.keys(registry.getAll())) {
            registry.delete(serviceName);
        }
        // Reset mocks
        vitest_1.vi.resetAllMocks();
        mockFetch.mockResolvedValue({
            ok: true,
            json: async () => ({ status: 'ok' }),
        });
    });
    (0, vitest_1.describe)('Server API', () => {
        (0, vitest_1.it)('should register and retrieve a service', async () => {
            // Create a test service
            const testService = {
                name: 'test-api-service',
                url: 'http://test-api:8080',
                healthCheckUrl: 'http://test-api:8080/health',
                metadata: { version: '1.0.0' },
            };
            // Register the service
            const registerResponse = await (0, supertest_1.default)(app).post('/register').send(testService);
            (0, vitest_1.expect)(registerResponse.status).toBe(201);
            // Verify the service is registered
            const getResponse = await (0, supertest_1.default)(app).get(`/services/${testService.name}`);
            (0, vitest_1.expect)(getResponse.status).toBe(200);
            (0, vitest_1.expect)(getResponse.body.url).toBe(testService.url);
        });
        (0, vitest_1.it)('should record a heartbeat for a service', async () => {
            // First register a service
            const testService = {
                name: 'heartbeat-service',
                url: 'http://heartbeat:8080',
            };
            await (0, supertest_1.default)(app).post('/register').send(testService);
            // Send a heartbeat
            const heartbeatResponse = await (0, supertest_1.default)(app).post(`/heartbeat/${testService.name}`);
            (0, vitest_1.expect)(heartbeatResponse.status).toBe(200);
        });
    });
    (0, vitest_1.describe)('Client Integration', () => {
        let client;
        (0, vitest_1.beforeEach)(() => {
            // Create a client for each test
            client = new client_1.ServiceRegistryClient({
                registryUrl: 'http://localhost:3002',
                serviceName: 'test-client',
                serviceUrl: 'http://test-client:8080',
                metadata: { version: '1.0.0' },
            });
        });
        (0, vitest_1.it)('should make correct API call when registering', async () => {
            // Set up mock response
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ status: 'registered' }),
            });
            // Call register
            await client.register();
            // Verify fetch was called with correct parameters
            (0, vitest_1.expect)(mockFetch).toHaveBeenCalledWith('http://localhost:3002/register', vitest_1.expect.objectContaining({
                method: 'POST',
                headers: vitest_1.expect.objectContaining({
                    'Content-Type': 'application/json',
                }),
                body: vitest_1.expect.any(String),
            }));
            // Verify request body
            const requestBody = JSON.parse(mockFetch.mock.calls[0][1].body);
            (0, vitest_1.expect)(requestBody).toEqual({
                name: 'test-client',
                url: 'http://test-client:8080',
                healthCheckUrl: undefined,
                metadata: { version: '1.0.0' },
            });
        });
        (0, vitest_1.it)('should make correct API call when discovering a service', async () => {
            // Set up mock response
            const mockServiceInfo = {
                url: 'http://discovered:8080',
                healthCheckUrl: 'http://discovered:8080/health',
                metadata: { version: '1.0.0' },
                lastHeartbeat: Date.now(),
            };
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => mockServiceInfo,
            });
            // Call discover
            const result = await client.discover('discovered-service');
            // Verify fetch was called with correct parameters
            (0, vitest_1.expect)(mockFetch).toHaveBeenCalledWith('http://localhost:3002/services/discovered-service');
            // Verify the result matches the mock response
            (0, vitest_1.expect)(result).toEqual(mockServiceInfo);
        });
    });
});
//# sourceMappingURL=integration.test.js.map