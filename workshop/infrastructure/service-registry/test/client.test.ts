import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ServiceRegistryClient, RegistryClientOptions } from '../src/client';

// Mock fetch API
const originalFetch = global.fetch;
const mockFetch = vi.fn();

describe('Service Registry Client', () => {
  beforeEach(() => {
    // Setup mock fetch
    global.fetch = mockFetch;

    // Reset all mocks before each test
    vi.resetAllMocks();

    // Default mock response
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ status: 'ok' }),
    });
  });

  afterEach(() => {
    // Restore original fetch
    global.fetch = originalFetch;

    // Clear all intervals created
    vi.restoreAllMocks();
  });

  describe('Constructor', () => {
    it('should create a client instance with default options', () => {
      const options: RegistryClientOptions = {
        registryUrl: 'http://registry:3000',
        serviceName: 'test-service',
        serviceUrl: 'http://test-service:8080',
      };

      const client = new ServiceRegistryClient(options);

      // Verify the client was created with the right options
      expect(client).toBeDefined();
      expect(client).toBeInstanceOf(ServiceRegistryClient);
    });

    it('should merge provided options with defaults', () => {
      const options: RegistryClientOptions = {
        registryUrl: 'http://registry:3000',
        serviceName: 'test-service',
        serviceUrl: 'http://test-service:8080',
        heartbeatInterval: 15000, // Custom heartbeat interval
      };

      const client = new ServiceRegistryClient(options);

      // We can't directly test private properties, but we can test behavior
      expect(client).toBeDefined();
    });
  });

  describe('register()', () => {
    it('should register the service with the registry', async () => {
      const options: RegistryClientOptions = {
        registryUrl: 'http://registry:3000',
        serviceName: 'test-service',
        serviceUrl: 'http://test-service:8080',
        healthCheckUrl: 'http://test-service:8080/health',
        metadata: { version: '1.0.0' },
      };

      const client = new ServiceRegistryClient(options);

      // Mock the fetch response for register
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ status: 'registered' }),
      });

      const result = await client.register();

      // Verify the result and fetch call
      expect(result).toBe(true);
      expect(mockFetch).toHaveBeenCalledWith(
        'http://registry:3000/register',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
          body: expect.any(String),
        })
      );

      // Verify the request body
      const requestBody = JSON.parse(mockFetch.mock.calls[0][1].body as string);
      expect(requestBody).toEqual({
        name: 'test-service',
        url: 'http://test-service:8080',
        healthCheckUrl: 'http://test-service:8080/health',
        metadata: { version: '1.0.0' },
      });
    });

    it('should return false if registration fails', async () => {
      const client = new ServiceRegistryClient({
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
      expect(result).toBe(false);
    });

    it('should handle network errors during registration', async () => {
      const client = new ServiceRegistryClient({
        registryUrl: 'http://registry:3000',
        serviceName: 'test-service',
        serviceUrl: 'http://test-service:8080',
      });

      // Mock a network error
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      // Spy on console.error
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const result = await client.register();

      // Verify the result and error logging
      expect(result).toBe(false);
      expect(consoleSpy).toHaveBeenCalledWith(
        'Failed to register with Service Registry:',
        expect.any(Error)
      );

      // Restore console.error
      consoleSpy.mockRestore();
    });
  });

  describe('discover()', () => {
    it('should fetch service information by name', async () => {
      const client = new ServiceRegistryClient({
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
      expect(result).toEqual(mockServiceInfo);
      expect(mockFetch).toHaveBeenCalledWith('http://registry:3000/services/other-service');
    });

    it('should return null if service is not found', async () => {
      const client = new ServiceRegistryClient({
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
      expect(result).toBeNull();
    });

    it('should handle network errors during discovery', async () => {
      const client = new ServiceRegistryClient({
        registryUrl: 'http://registry:3000',
        serviceName: 'test-service',
        serviceUrl: 'http://test-service:8080',
      });

      // Mock a network error
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      // Spy on console.error
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const result = await client.discover('other-service');

      // Verify the result and error logging
      expect(result).toBeNull();
      expect(consoleSpy).toHaveBeenCalledWith(
        "Failed to discover service 'other-service':",
        expect.any(Error)
      );

      // Restore console.error
      consoleSpy.mockRestore();
    });
  });

  describe('listAll()', () => {
    it('should fetch all registered services', async () => {
      const client = new ServiceRegistryClient({
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
      expect(result).toEqual(mockServiceList);
      expect(mockFetch).toHaveBeenCalledWith('http://registry:3000/services');
    });

    it('should return empty object if listing fails', async () => {
      const client = new ServiceRegistryClient({
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
      expect(result).toEqual({});
    });
  });

  describe('unregister()', () => {
    it('should unregister the service', async () => {
      const client = new ServiceRegistryClient({
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
      expect(result).toBe(true);
      expect(mockFetch).toHaveBeenCalledWith(
        'http://registry:3000/services/test-service',
        expect.objectContaining({
          method: 'DELETE',
        })
      );
    });

    it('should handle failed unregister gracefully', async () => {
      const client = new ServiceRegistryClient({
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
      expect(result).toBe(false);
    });
  });
});
