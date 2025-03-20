import request from 'supertest';
import express from 'express';
import jwt from 'jsonwebtoken';
import { describe, it, expect, beforeAll } from 'vitest';

// Import directly from source for integration tests (no mocking)
// We'll use the actual implementation to test integration scenarios

describe('IAM Service Integration Tests', () => {
  let app: express.Application;
  let mockJwtSecret: string;

  beforeAll(async () => {
    // Setup environment for tests
    mockJwtSecret = 'integration-test-secret';
    process.env.JWT_SECRET = mockJwtSecret;
    process.env.PORT = '3000';

    // Import the actual server (not mocked)
    const serverModule = await import('../src/server');
    app = serverModule.default;
  });

  describe('Client Credentials Flow', () => {
    it('should complete a full OAuth client credentials flow', async () => {
      // Step 1: Get a token
      const tokenResponse = await request(app).post('/oauth/token').send({
        client_id: 'sample-service',
        client_secret: 'sample-service-secret',
        grant_type: 'client_credentials',
        scope: 'read:sample write:sample',
      });

      expect(tokenResponse.status).toBe(200);
      expect(tokenResponse.body).toHaveProperty('access_token');
      expect(tokenResponse.body.token_type).toBe('bearer');
      expect(tokenResponse.body.scope).toBe('read:sample write:sample');

      const accessToken = tokenResponse.body.access_token;

      // Step 2: Introspect the token
      const introspectResponse = await request(app)
        .post('/oauth/introspect')
        .send({ token: accessToken });

      expect(introspectResponse.status).toBe(200);
      expect(introspectResponse.body.active).toBe(true);
      expect(introspectResponse.body.client_id).toBe('sample-service');
      expect(introspectResponse.body.scope).toBe('read:sample write:sample');

      // Step 3: Verify token directly (simulating API Gateway validation)
      const decodedToken = jwt.verify(accessToken, mockJwtSecret) as any;
      expect(decodedToken.client_id).toBe('sample-service');
      expect(decodedToken.scope).toBe('read:sample write:sample');
    });

    it('should handle cross-service scopes based on client permissions', async () => {
      // Get token for emergency-police-service
      const policeTokenResponse = await request(app).post('/oauth/token').send({
        client_id: 'emergency-police-service',
        client_secret: 'police-service-secret',
        grant_type: 'client_credentials',
        scope: 'read:incidents write:incidents read:emergency',
      });

      expect(policeTokenResponse.status).toBe(200);
      expect(policeTokenResponse.body.scope).toBe('read:incidents write:incidents read:emergency');

      // Try to get token with unauthorized scope
      const unauthorizedScopeResponse = await request(app).post('/oauth/token').send({
        client_id: 'emergency-police-service',
        client_secret: 'police-service-secret',
        grant_type: 'client_credentials',
        scope: 'read:incidents write:emergencies', // police service can't write emergencies
      });

      expect(unauthorizedScopeResponse.status).toBe(200);
      expect(unauthorizedScopeResponse.body.scope).toBe('read:incidents');
      expect(unauthorizedScopeResponse.body.scope).not.toContain('write:emergencies');
    });
  });

  describe('Multi-Service Integration', () => {
    it('should support different scopes for different city services', async () => {
      // Test police service
      const policeResponse = await request(app).post('/oauth/token').send({
        client_id: 'emergency-police-service',
        client_secret: 'police-service-secret',
        grant_type: 'client_credentials',
        scope: 'read:incidents write:incidents',
      });

      expect(policeResponse.status).toBe(200);
      expect(policeResponse.body).toHaveProperty('access_token');
      expect(policeResponse.body.scope).toBe('read:incidents write:incidents');

      // Test water service
      const waterResponse = await request(app).post('/oauth/token').send({
        client_id: 'utilities-water-service',
        client_secret: 'water-service-secret',
        grant_type: 'client_credentials',
        scope: 'read:usage read:outages',
      });

      expect(waterResponse.status).toBe(200);
      expect(waterResponse.body).toHaveProperty('access_token');
      expect(waterResponse.body.scope).toBe('read:usage read:outages');

      // Verify introspection works with police token
      const policeIntrospection = await request(app)
        .post('/oauth/introspect')
        .send({ token: policeResponse.body.access_token });

      expect(policeIntrospection.body.active).toBe(true);
      expect(policeIntrospection.body.client_id).toBe('emergency-police-service');
      expect(policeIntrospection.body.scope).toBe('read:incidents write:incidents');
    });
  });

  describe('Error Handling', () => {
    it('should handle a complete error scenario gracefully', async () => {
      // Step 1: Try with invalid client credentials
      const invalidClientResponse = await request(app).post('/oauth/token').send({
        client_id: 'fake-service',
        client_secret: 'wrong-secret',
        grant_type: 'client_credentials',
        scope: 'read:fake',
      });

      expect(invalidClientResponse.status).toBe(401);

      // Step 2: Try with invalid grant type
      const invalidGrantResponse = await request(app).post('/oauth/token').send({
        client_id: 'sample-service',
        client_secret: 'sample-service-secret',
        grant_type: 'authorization_code',
        scope: 'read:sample',
      });

      expect(invalidGrantResponse.status).toBe(400);
      expect(invalidGrantResponse.body.error).toBe('unsupported_grant_type');

      // Step 3: Introspect an invalid token
      const invalidTokenIntrospection = await request(app)
        .post('/oauth/introspect')
        .send({ token: 'invalid-token-string' });

      expect(invalidTokenIntrospection.status).toBe(200);
      expect(invalidTokenIntrospection.body.active).toBe(false);
    });
  });
});
