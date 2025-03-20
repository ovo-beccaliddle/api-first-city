import request from 'supertest';
import express from 'express';
import { describe, it, expect, beforeAll, afterAll, vi, beforeEach } from 'vitest';

// Mock the common module
vi.mock('@city-services/common', () => {
  return {
    errorHandler: vi.fn((err: any, req: any, res: any, next: any) => next(err)),
    requestLogger: vi.fn(() => (req: any, res: any, next: any) => next()),
  };
});

describe('Service Registry Server', () => {
  let app: express.Application;

  beforeAll(async () => {
    // Clear module cache to ensure a fresh server instance
    vi.resetModules();

    // Set up test environment variables if needed
    process.env.PORT = '3001';

    // Import the server module directly
    const { app: expressApp } = await import('../src/server');
    app = expressApp;
  });

  describe('Health Check Endpoint', () => {
    it('should return 200 OK status with correct response', async () => {
      const response = await request(app).get('/health');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'ok');
      expect(response.body).toHaveProperty('version');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('services');
    });
  });

  describe('Service Registration', () => {
    const testService = {
      name: 'test-service',
      url: 'http://test-service:8080',
      healthCheckUrl: 'http://test-service:8080/health',
      metadata: { version: '1.0.0' },
    };

    afterEach(async () => {
      // Clean up registered service
      try {
        await request(app).delete(`/services/${testService.name}`);
      } catch (e) {
        // Ignore cleanup errors
      }
    });

    it('should register a new service', async () => {
      const response = await request(app).post('/register').send(testService);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('status', 'registered');
    });

    it('should require service name and URL', async () => {
      const response = await request(app).post('/register').send({ name: 'incomplete-service' });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'bad_request');
    });

    it('should retrieve a registered service', async () => {
      // First, register a service
      await request(app).post('/register').send(testService);

      // Then retrieve it
      const response = await request(app).get(`/services/${testService.name}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('url', testService.url);
      expect(response.body).toHaveProperty('healthCheckUrl', testService.healthCheckUrl);
      expect(response.body).toHaveProperty('lastHeartbeat');
      expect(response.body.metadata).toEqual(testService.metadata);
    });

    it('should return 404 for non-existent service', async () => {
      const response = await request(app).get('/services/non-existent-service');

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error', 'not_found');
    });

    it('should list all registered services', async () => {
      // Register a service if not already registered
      await request(app).post('/register').send(testService);

      const response = await request(app).get('/services');

      expect(response.status).toBe(200);
      expect(response.body).toBeTypeOf('object');
      expect(response.body).toHaveProperty(testService.name);
    });
  });

  describe('Service Updates', () => {
    const testService = {
      name: 'update-test-service',
      url: 'http://test-service:8080',
      healthCheckUrl: 'http://test-service:8080/health',
      metadata: { version: '1.0.0' },
    };

    beforeEach(async () => {
      // Register a fresh service for each test
      await request(app).post('/register').send(testService);
    });

    afterEach(async () => {
      // Clean up registered service
      try {
        await request(app).delete(`/services/${testService.name}`);
      } catch (e) {
        // Ignore cleanup errors
      }
    });

    it('should update an existing service', async () => {
      const updatedData = {
        url: 'http://updated-service:9000',
        healthCheckUrl: 'http://test-service:8080/health',
        metadata: { version: '2.0.0' },
      };

      const response = await request(app).put(`/services/${testService.name}`).send(updatedData);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'updated');

      // Verify the update
      const getResponse = await request(app).get(`/services/${testService.name}`);
      expect(getResponse.body.url).toBe(updatedData.url);
      expect(getResponse.body.metadata).toEqual(updatedData.metadata);
      expect(getResponse.body.healthCheckUrl).toBe(updatedData.healthCheckUrl);
    });

    it('should return 404 when updating non-existent service', async () => {
      const response = await request(app)
        .put('/services/non-existent-service')
        .send({ url: 'http://new-url:8080' });

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error', 'not_found');
    });
  });

  describe('Heartbeat Management', () => {
    const testService = {
      name: 'heartbeat-test-service',
      url: 'http://test-service:8080',
    };

    beforeEach(async () => {
      // Register a service for heartbeat tests
      await request(app).post('/register').send(testService);
    });

    afterEach(async () => {
      // Clean up registered service
      try {
        await request(app).delete(`/services/${testService.name}`);
      } catch (e) {
        // Ignore cleanup errors
      }
    });

    it('should record a heartbeat for a registered service', async () => {
      const response = await request(app).post(`/heartbeat/${testService.name}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'ok');

      // Verify the service still exists
      const getResponse = await request(app).get(`/services/${testService.name}`);
      expect(getResponse.status).toBe(200);
    });

    it('should return 404 for heartbeat to non-existent service', async () => {
      const response = await request(app).post('/heartbeat/non-existent-service');

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error', 'not_found');
    });
  });

  describe('Service Deletion', () => {
    const testService = {
      name: 'delete-test-service',
      url: 'http://test-service:8080',
    };

    beforeEach(async () => {
      // Register a fresh service for each test
      await request(app).post('/register').send(testService);
    });

    it('should delete a registered service', async () => {
      const response = await request(app).delete(`/services/${testService.name}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'deleted');

      // Verify the service is gone
      const getResponse = await request(app).get(`/services/${testService.name}`);
      expect(getResponse.status).toBe(404);
    });

    it('should return 404 when deleting non-existent service', async () => {
      // First delete the service
      await request(app).delete(`/services/${testService.name}`);

      // Try to delete it again
      const response = await request(app).delete(`/services/${testService.name}`);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error', 'not_found');
    });
  });
});
