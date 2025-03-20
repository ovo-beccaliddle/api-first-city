import request from 'supertest';
import express from 'express';
import { describe, it, expect, beforeAll, afterAll, vi, beforeEach, afterEach } from 'vitest';
import { ServiceRegistryClient } from '../src/client';

// Mock fetch for client tests
const originalFetch = global.fetch;

describe('Service Registry Integration', () => {
  let app: express.Application;
  let registry: any;
  let mockFetch: any;

  beforeAll(async () => {
    // Clear module cache to ensure a fresh server instance
    vi.resetModules();

    // Set up test environment variables
    process.env.PORT = '3002'; // Different port from server tests

    // Import the server directly
    const serverModule = await import('../src/server');
    app = serverModule.app;
    registry = serverModule.registry;

    // Set up fetch mock for client tests
    mockFetch = vi.fn();
    global.fetch = mockFetch;
  });

  afterAll(() => {
    // Restore original fetch
    global.fetch = originalFetch;
  });

  beforeEach(() => {
    // Clear registry before each test
    for (const serviceName of Object.keys(registry.getAll())) {
      registry.delete(serviceName);
    }

    // Reset mocks
    vi.resetAllMocks();
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ status: 'ok' }),
    });
  });

  describe('Server API', () => {
    it('should register and retrieve a service', async () => {
      // Create a test service
      const testService = {
        name: 'test-api-service',
        url: 'http://test-api:8080',
        healthCheckUrl: 'http://test-api:8080/health',
        metadata: { version: '1.0.0' },
      };

      // Register the service
      const registerResponse = await request(app).post('/register').send(testService);

      expect(registerResponse.status).toBe(201);

      // Verify the service is registered
      const getResponse = await request(app).get(`/services/${testService.name}`);

      expect(getResponse.status).toBe(200);
      expect(getResponse.body.url).toBe(testService.url);
    });

    it('should record a heartbeat for a service', async () => {
      // First register a service
      const testService = {
        name: 'heartbeat-service',
        url: 'http://heartbeat:8080',
      };

      await request(app).post('/register').send(testService);

      // Send a heartbeat
      const heartbeatResponse = await request(app).post(`/heartbeat/${testService.name}`);

      expect(heartbeatResponse.status).toBe(200);
    });
  });

  describe('Client Integration', () => {
    let client: ServiceRegistryClient;

    beforeEach(() => {
      // Create a client for each test
      client = new ServiceRegistryClient({
        registryUrl: 'http://localhost:3002',
        serviceName: 'test-client',
        serviceUrl: 'http://test-client:8080',
        metadata: { version: '1.0.0' },
      });
    });

    it('should make correct API call when registering', async () => {
      // Set up mock response
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ status: 'registered' }),
      });

      // Call register
      await client.register();

      // Verify fetch was called with correct parameters
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3002/register',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
          body: expect.any(String),
        })
      );

      // Verify request body
      const requestBody = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(requestBody).toEqual({
        name: 'test-client',
        url: 'http://test-client:8080',
        healthCheckUrl: undefined,
        metadata: { version: '1.0.0' },
      });
    });

    it('should make correct API call when discovering a service', async () => {
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
      expect(mockFetch).toHaveBeenCalledWith('http://localhost:3002/services/discovered-service');

      // Verify the result matches the mock response
      expect(result).toEqual(mockServiceInfo);
    });
  });
});
