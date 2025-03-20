import request from 'supertest';
import express from 'express';
import { describe, it, expect, beforeAll, beforeEach, vi } from 'vitest';
import { generateToken, verifyToken } from '../src/auth';

// Mock the auth module
vi.mock('../src/auth', () => {
  return {
    generateToken: vi.fn(),
    verifyToken: vi.fn(),
  };
});

// Mock the common module
vi.mock('@city-services/common', () => {
  return {
    errorHandler: vi.fn((err: any, req: any, res: any, next: any) => next(err)),
    requestLogger: vi.fn(() => (req: any, res: any, next: any) => next()),
  };
});

describe('IAM Server', () => {
  let app: express.Application;

  beforeAll(async () => {
    // Save original env vars
    process.env.JWT_SECRET = 'test-secret';
    process.env.PORT = '3000';

    // Clear mocks
    vi.clearAllMocks();

    // Dynamic import for better compatibility
    const serverModule = await import('../src/server');
    app = serverModule.default;
  });

  describe('Health Check Endpoint', () => {
    it('should return 200 OK status with correct response', async () => {
      const response = await request(app).get('/health');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ status: 'ok' });
    });
  });

  describe('OAuth Token Endpoint', () => {
    beforeEach(() => {
      // Reset mocks before each test
      vi.resetAllMocks();
    });

    it('should return access token for valid client credentials', async () => {
      // Mock generateToken to return a predictable value
      vi.mocked(generateToken).mockReturnValue('mock-token-123');

      const response = await request(app).post('/oauth/token').send({
        client_id: 'sample-service',
        client_secret: 'sample-service-secret',
        grant_type: 'client_credentials',
        scope: 'read:sample write:sample',
      });

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        access_token: 'mock-token-123',
        token_type: 'bearer',
        expires_in: 3600,
        scope: 'read:sample write:sample',
      });

      // Verify the generateToken was called with the right arguments
      expect(generateToken).toHaveBeenCalledWith({
        client_id: 'sample-service',
        scope: 'read:sample write:sample',
      });
    });

    it('should return 400 if missing client credentials', async () => {
      const response = await request(app).post('/oauth/token').send({
        grant_type: 'client_credentials',
        scope: 'read:sample',
      });

      expect(response.status).toBe(400);
      expect(response.body).toMatchObject({
        error: 'invalid_request',
        error_description: expect.stringContaining('Missing client credentials'),
      });
    });

    it('should return 400 if grant type is not client_credentials', async () => {
      const response = await request(app).post('/oauth/token').send({
        client_id: 'sample-service',
        client_secret: 'sample-service-secret',
        grant_type: 'password',
        scope: 'read:sample',
      });

      expect(response.status).toBe(400);
      expect(response.body).toMatchObject({
        error: 'unsupported_grant_type',
        error_description: expect.stringContaining(
          'Only client_credentials grant type is supported'
        ),
      });
    });

    it('should return 401 if client credentials are invalid', async () => {
      const response = await request(app).post('/oauth/token').send({
        client_id: 'sample-service',
        client_secret: 'wrong-secret',
        grant_type: 'client_credentials',
        scope: 'read:sample',
      });

      expect(response.status).toBe(401);
      expect(response.body).toMatchObject({
        error: 'invalid_client',
        error_description: expect.stringContaining('Invalid client credentials'),
      });
    });

    it('should return 400 if no valid scopes are requested', async () => {
      const response = await request(app).post('/oauth/token').send({
        client_id: 'sample-service',
        client_secret: 'sample-service-secret',
        grant_type: 'client_credentials',
        scope: 'invalid:scope',
      });

      expect(response.status).toBe(400);
      expect(response.body).toMatchObject({
        error: 'invalid_scope',
        error_description: expect.stringContaining('No valid scopes requested'),
      });
    });

    it('should only grant allowed scopes for the client', async () => {
      // Mock generateToken to return a predictable value
      vi.mocked(generateToken).mockReturnValue('mock-token-456');

      const response = await request(app).post('/oauth/token').send({
        client_id: 'sample-service',
        client_secret: 'sample-service-secret',
        grant_type: 'client_credentials',
        scope: 'read:sample invalid:scope',
      });

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        access_token: 'mock-token-456',
        scope: 'read:sample', // Only the valid scope is included
      });

      // Verify generateToken was called with only the allowed scope
      expect(generateToken).toHaveBeenCalledWith({
        client_id: 'sample-service',
        scope: 'read:sample',
      });
    });
  });

  describe('Token Introspection Endpoint', () => {
    beforeEach(() => {
      vi.resetAllMocks();
    });

    it('should return active=true with token info for valid token', async () => {
      // Mock verifyToken to return decoded token
      vi.mocked(verifyToken).mockReturnValue({
        client_id: 'sample-service',
        scope: 'read:sample',
        exp: Math.floor(Date.now() / 1000) + 3600,
      });

      const response = await request(app).post('/oauth/introspect').send({
        token: 'valid-token',
      });

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        active: true,
        client_id: 'sample-service',
        scope: 'read:sample',
        exp: expect.any(Number),
      });

      // Verify verifyToken was called with the right token
      expect(verifyToken).toHaveBeenCalledWith('valid-token');
    });

    it('should return active=false for invalid token', async () => {
      // Mock verifyToken to throw an error
      vi.mocked(verifyToken).mockImplementation(() => {
        throw new Error('Invalid token');
      });

      const response = await request(app).post('/oauth/introspect').send({
        token: 'invalid-token',
      });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ active: false });

      // Verify verifyToken was called
      expect(verifyToken).toHaveBeenCalledWith('invalid-token');
    });

    it('should return 400 if token is missing', async () => {
      const response = await request(app).post('/oauth/introspect').send({});

      expect(response.status).toBe(400);
      expect(response.body).toMatchObject({
        error: 'invalid_request',
        error_description: expect.stringContaining('Missing token parameter'),
      });
    });
  });

  describe('JWKS Endpoint', () => {
    it('should return a JWKS with mock key information', async () => {
      const response = await request(app).get('/.well-known/jwks.json');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('keys');
      expect(response.body.keys).toBeInstanceOf(Array);
      expect(response.body.keys.length).toBeGreaterThan(0);

      // Verify the key structure
      const key = response.body.keys[0];
      expect(key).toMatchObject({
        kty: 'RSA',
        kid: expect.any(String),
        use: 'sig',
        alg: 'RS256',
      });
    });
  });
});
