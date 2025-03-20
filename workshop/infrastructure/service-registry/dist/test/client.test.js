"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const client_1 = require("../src/client");
// Mock fetch API
const originalFetch = global.fetch;
const mockFetch = vitest_1.vi.fn();
(0, vitest_1.describe)('Service Registry Client', () => {
    (0, vitest_1.beforeEach)(() => {
        // Setup mock fetch
        global.fetch = mockFetch;
        // Reset all mocks before each test
        vitest_1.vi.resetAllMocks();
        // Default mock response
        mockFetch.mockResolvedValue({
            ok: true,
            json: async () => ({ status: 'ok' }),
        });
    });
    (0, vitest_1.afterEach)(() => {
        // Restore original fetch
        global.fetch = originalFetch;
        // Clear all intervals created
        vitest_1.vi.restoreAllMocks();
    });
    (0, vitest_1.describe)('Constructor', () => {
        (0, vitest_1.it)('should create a client instance with default options', () => {
            const options = {
                registryUrl: 'http://registry:3000',
                serviceName: 'test-service',
                serviceUrl: 'http://test-service:8080',
            };
            const client = new client_1.ServiceRegistryClient(options);
            // Verify the client was created with the right options
            (0, vitest_1.expect)(client).toBeDefined();
            (0, vitest_1.expect)(client).toBeInstanceOf(client_1.ServiceRegistryClient);
        });
        (0, vitest_1.it)('should merge provided options with defaults', () => {
            const options = {
                registryUrl: 'http://registry:3000',
                serviceName: 'test-service',
                serviceUrl: 'http://test-service:8080',
                heartbeatInterval: 15000, // Custom heartbeat interval
            };
            const client = new client_1.ServiceRegistryClient(options);
            // We can't directly test private properties, but we can test behavior
            (0, vitest_1.expect)(client).toBeDefined();
        });
    });
    (0, vitest_1.describe)('register()', () => {
        (0, vitest_1.it)('should register the service with the registry', async () => {
            const options = {
                registryUrl: 'http://registry:3000',
                serviceName: 'test-service',
                serviceUrl: 'http://test-service:8080',
                healthCheckUrl: 'http://test-service:8080/health',
                metadata: { version: '1.0.0' },
            };
            const client = new client_1.ServiceRegistryClient(options);
            // Mock the fetch response for register
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ status: 'registered' }),
            });
            const result = await client.register();
            // Verify the result and fetch call
            (0, vitest_1.expect)(result).toBe(true);
            (0, vitest_1.expect)(mockFetch).toHaveBeenCalledWith('http://registry:3000/register', vitest_1.expect.objectContaining({
                method: 'POST',
                headers: vitest_1.expect.objectContaining({
                    'Content-Type': 'application/json',
                }),
                body: vitest_1.expect.any(String),
            }));
            // Verify the request body
            const requestBody = JSON.parse(mockFetch.mock.calls[0][1].body);
            (0, vitest_1.expect)(requestBody).toEqual({
                name: 'test-service',
                url: 'http://test-service:8080',
                healthCheckUrl: 'http://test-service:8080/health',
                metadata: { version: '1.0.0' },
            });
        });
        (0, vitest_1.it)('should return false if registration fails', async () => {
            const client = new client_1.ServiceRegistryClient({
                registryUrl: 'http://registry:3000',
                serviceName: 'test-service',
                serviceUrl: 'http://test-service:8080',
            });
            // Mock a failed registration
            mockFetch.mockResolvedValueOnce({
                ok: false,
                status: 400,
                json: async () => ({ error: 'bad_request' }),
            });
            const result = await client.register();
            // Verify the result
            (0, vitest_1.expect)(result).toBe(false);
        });
        (0, vitest_1.it)('should handle network errors during registration', async () => {
            const client = new client_1.ServiceRegistryClient({
                registryUrl: 'http://registry:3000',
                serviceName: 'test-service',
                serviceUrl: 'http://test-service:8080',
            });
            // Mock a network error
            mockFetch.mockRejectedValueOnce(new Error('Network error'));
            // Spy on console.error
            const consoleSpy = vitest_1.vi.spyOn(console, 'error').mockImplementation(() => { });
            const result = await client.register();
            // Verify the result and error logging
            (0, vitest_1.expect)(result).toBe(false);
            (0, vitest_1.expect)(consoleSpy).toHaveBeenCalledWith('Failed to register with Service Registry:', vitest_1.expect.any(Error));
            // Restore console.error
            consoleSpy.mockRestore();
        });
    });
    (0, vitest_1.describe)('discover()', () => {
        (0, vitest_1.it)('should fetch service information by name', async () => {
            const client = new client_1.ServiceRegistryClient({
                registryUrl: 'http://registry:3000',
                serviceName: 'test-service',
                serviceUrl: 'http://test-service:8080',
            });
            const mockServiceInfo = {
                url: 'http://other-service:8080',
                healthCheckUrl: 'http://other-service:8080/health',
                metadata: { version: '1.0.0' },
                lastHeartbeat: Date.now(),
            };
            // Mock successful service discovery
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => mockServiceInfo,
            });
            const result = await client.discover('other-service');
            // Verify the result and fetch call
            (0, vitest_1.expect)(result).toEqual(mockServiceInfo);
            (0, vitest_1.expect)(mockFetch).toHaveBeenCalledWith('http://registry:3000/services/other-service');
        });
        (0, vitest_1.it)('should return null if service is not found', async () => {
            const client = new client_1.ServiceRegistryClient({
                registryUrl: 'http://registry:3000',
                serviceName: 'test-service',
                serviceUrl: 'http://test-service:8080',
            });
            // Mock service not found
            mockFetch.mockResolvedValueOnce({
                ok: false,
                status: 404,
                json: async () => ({ error: 'not_found' }),
            });
            const result = await client.discover('non-existent-service');
            // Verify the result
            (0, vitest_1.expect)(result).toBeNull();
        });
        (0, vitest_1.it)('should handle network errors during discovery', async () => {
            const client = new client_1.ServiceRegistryClient({
                registryUrl: 'http://registry:3000',
                serviceName: 'test-service',
                serviceUrl: 'http://test-service:8080',
            });
            // Mock a network error
            mockFetch.mockRejectedValueOnce(new Error('Network error'));
            // Spy on console.error
            const consoleSpy = vitest_1.vi.spyOn(console, 'error').mockImplementation(() => { });
            const result = await client.discover('other-service');
            // Verify the result and error logging
            (0, vitest_1.expect)(result).toBeNull();
            (0, vitest_1.expect)(consoleSpy).toHaveBeenCalledWith("Failed to discover service 'other-service':", vitest_1.expect.any(Error));
            // Restore console.error
            consoleSpy.mockRestore();
        });
    });
    (0, vitest_1.describe)('listAll()', () => {
        (0, vitest_1.it)('should fetch all registered services', async () => {
            const client = new client_1.ServiceRegistryClient({
                registryUrl: 'http://registry:3000',
                serviceName: 'test-service',
                serviceUrl: 'http://test-service:8080',
            });
            const mockServiceList = {
                'service-1': {
                    url: 'http://service-1:8080',
                    lastHeartbeat: Date.now(),
                    metadata: {},
                },
                'service-2': {
                    url: 'http://service-2:8080',
                    lastHeartbeat: Date.now(),
                    metadata: {},
                },
            };
            // Mock successful service listing
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => mockServiceList,
            });
            const result = await client.listAll();
            // Verify the result and fetch call
            (0, vitest_1.expect)(result).toEqual(mockServiceList);
            (0, vitest_1.expect)(mockFetch).toHaveBeenCalledWith('http://registry:3000/services');
        });
        (0, vitest_1.it)('should return empty object if listing fails', async () => {
            const client = new client_1.ServiceRegistryClient({
                registryUrl: 'http://registry:3000',
                serviceName: 'test-service',
                serviceUrl: 'http://test-service:8080',
            });
            // Mock failed service listing
            mockFetch.mockResolvedValueOnce({
                ok: false,
                status: 500,
                json: async () => ({ error: 'server_error' }),
            });
            const result = await client.listAll();
            // Verify the result
            (0, vitest_1.expect)(result).toEqual({});
        });
    });
    (0, vitest_1.describe)('unregister()', () => {
        (0, vitest_1.it)('should unregister the service', async () => {
            const client = new client_1.ServiceRegistryClient({
                registryUrl: 'http://registry:3000',
                serviceName: 'test-service',
                serviceUrl: 'http://test-service:8080',
            });
            // We need to register first to set isRegistered flag
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ status: 'registered' }),
            });
            await client.register();
            // Reset the mock for unregister call
            mockFetch.mockReset();
            // Mock successful unregister
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ status: 'deleted' }),
            });
            const result = await client.unregister();
            // Verify the result and fetch call
            (0, vitest_1.expect)(result).toBe(true);
            (0, vitest_1.expect)(mockFetch).toHaveBeenCalledWith('http://registry:3000/services/test-service', vitest_1.expect.objectContaining({
                method: 'DELETE',
            }));
        });
        (0, vitest_1.it)('should handle failed unregister gracefully', async () => {
            const client = new client_1.ServiceRegistryClient({
                registryUrl: 'http://registry:3000',
                serviceName: 'test-service',
                serviceUrl: 'http://test-service:8080',
            });
            // We need to register first to set isRegistered flag
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ status: 'registered' }),
            });
            await client.register();
            // Reset the mock for unregister call
            mockFetch.mockReset();
            // Mock failed unregister
            mockFetch.mockResolvedValueOnce({
                ok: false,
                status: 404,
                json: async () => ({ error: 'not_found' }),
            });
            const result = await client.unregister();
            // Verify the result
            (0, vitest_1.expect)(result).toBe(false);
        });
    });
});
//# sourceMappingURL=client.test.js.map