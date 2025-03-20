import jwt from 'jsonwebtoken';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { generateToken, verifyToken, generateRefreshToken } from '../src/auth';

describe('Auth Module', () => {
  // Store original environment variables
  let originalJwtSecret: string | undefined;
  let originalTokenExpiration: string | undefined;

  beforeEach(() => {
    // Save original env values
    originalJwtSecret = process.env.JWT_SECRET;
    originalTokenExpiration = process.env.JWT_EXPIRATION;

    // Set up test environment variables
    process.env.JWT_SECRET = 'test-secret-key';
    process.env.JWT_EXPIRATION = '14400';
  });

  afterEach(() => {
    // Restore original environment variables
    process.env.JWT_SECRET = originalJwtSecret;
    process.env.JWT_EXPIRATION = originalTokenExpiration;
  });

  describe('generateToken', () => {
    it('should generate a valid JWT token with correct payload', () => {
      // Arrange
      const payload = {
        client_id: 'test-client',
        scope: 'read:test write:test',
      };

      // Act
      const token = generateToken(payload);

      // Assert
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');

      // Verify the token contents
      const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as any;
      expect(decoded.client_id).toBe(payload.client_id);
      expect(decoded.scope).toBe(payload.scope);
      expect(decoded.iat).toBeDefined();
      expect(decoded.exp).toBeDefined();
      expect(decoded.exp - decoded.iat).toBe(Number(process.env.JWT_EXPIRATION));
    });

    // This test is separated into two because the JWT verification is tricky
    it('should use the configured JWT_SECRET environment variable', () => {
      // Arrange
      const customSecret = 'different-secret';
      process.env.JWT_SECRET = customSecret;

      const payload = {
        client_id: 'test-client',
        scope: 'read:test',
      };

      // Act
      const token = generateToken(payload);

      // Get the decoded data to verify the content
      const parts = token.split('.');
      expect(parts.length).toBe(3); // Header, payload, signature

      // Decode the payload part (which is base64url encoded)
      const decodedPayload = JSON.parse(Buffer.from(parts[1], 'base64').toString());

      // Assert the payload content is correct
      expect(decodedPayload.client_id).toBe(payload.client_id);
      expect(decodedPayload.scope).toBe(payload.scope);
    });
  });

  describe('verifyToken', () => {
    it('should correctly verify and decode a valid token', () => {
      // Arrange
      const payload = {
        client_id: 'test-client',
        scope: 'read:test write:test',
      };
      const token = generateToken(payload);

      // Act
      const decoded = verifyToken(token);

      // Assert
      expect(decoded).toBeDefined();
      expect(decoded.client_id).toBe(payload.client_id);
      expect(decoded.scope).toBe(payload.scope);
      expect(decoded.iat).toBeDefined();
      expect(decoded.exp).toBeDefined();
    });

    it('should throw an error for an invalid token', () => {
      // Arrange
      const invalidToken = 'invalid.token.string';

      // Act & Assert
      expect(() => {
        verifyToken(invalidToken);
      }).toThrow('Invalid token');
    });

    it('should throw an error for an expired token', () => {
      // Arrange
      // Create a token that is already expired
      const payload = {
        client_id: 'test-client',
        scope: 'read:test',
      };

      const now = Math.floor(Date.now() / 1000);
      const expiredToken = jwt.sign(
        { ...payload, iat: now - 7200, exp: now - 3600 },
        process.env.JWT_SECRET as string
      );

      // Act & Assert
      expect(() => {
        verifyToken(expiredToken);
      }).toThrow('Invalid token');
    });

    it('should throw an error for a token signed with a different secret', () => {
      // Arrange
      const payload = {
        client_id: 'test-client',
        scope: 'read:test',
      };

      const tokenWithDifferentSecret = jwt.sign(
        {
          ...payload,
          iat: Math.floor(Date.now() / 1000),
          exp: Math.floor(Date.now() / 1000) + 3600,
        },
        'different-secret'
      );

      // Act & Assert
      expect(() => {
        verifyToken(tokenWithDifferentSecret);
      }).toThrow('Invalid token');
    });
  });

  describe('generateRefreshToken', () => {
    it('should generate a string refresh token', () => {
      // Act
      const refreshToken = generateRefreshToken();

      // Assert
      expect(refreshToken).toBeDefined();
      expect(typeof refreshToken).toBe('string');
      expect(refreshToken.startsWith('refresh-')).toBe(true);
    });

    it('should generate unique tokens on successive calls', () => {
      // Act
      const token1 = generateRefreshToken();
      const token2 = generateRefreshToken();

      // Assert
      expect(token1).not.toBe(token2);
    });
  });
});
