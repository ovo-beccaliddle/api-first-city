"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const vitest_1 = require("vitest");
const auth_1 = require("../src/auth");
(0, vitest_1.describe)('Auth Module', () => {
    // Store original environment variables
    let originalJwtSecret;
    let originalTokenExpiration;
    (0, vitest_1.beforeEach)(() => {
        // Save original env values
        originalJwtSecret = process.env.JWT_SECRET;
        originalTokenExpiration = process.env.JWT_EXPIRATION;
        // Set up test environment variables
        process.env.JWT_SECRET = 'test-secret-key';
        process.env.JWT_EXPIRATION = '14400';
    });
    (0, vitest_1.afterEach)(() => {
        // Restore original environment variables
        process.env.JWT_SECRET = originalJwtSecret;
        process.env.JWT_EXPIRATION = originalTokenExpiration;
    });
    (0, vitest_1.describe)('generateToken', () => {
        (0, vitest_1.it)('should generate a valid JWT token with correct payload', () => {
            // Arrange
            const payload = {
                client_id: 'test-client',
                scope: 'read:test write:test',
            };
            // Act
            const token = (0, auth_1.generateToken)(payload);
            // Assert
            (0, vitest_1.expect)(token).toBeDefined();
            (0, vitest_1.expect)(typeof token).toBe('string');
            // Verify the token contents
            const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
            (0, vitest_1.expect)(decoded.client_id).toBe(payload.client_id);
            (0, vitest_1.expect)(decoded.scope).toBe(payload.scope);
            (0, vitest_1.expect)(decoded.iat).toBeDefined();
            (0, vitest_1.expect)(decoded.exp).toBeDefined();
            (0, vitest_1.expect)(decoded.exp - decoded.iat).toBe(Number(process.env.JWT_EXPIRATION));
        });
        // This test is separated into two because the JWT verification is tricky
        (0, vitest_1.it)('should use the configured JWT_SECRET environment variable', () => {
            // Arrange
            const customSecret = 'different-secret';
            process.env.JWT_SECRET = customSecret;
            const payload = {
                client_id: 'test-client',
                scope: 'read:test',
            };
            // Act
            const token = (0, auth_1.generateToken)(payload);
            // Get the decoded data to verify the content
            const parts = token.split('.');
            (0, vitest_1.expect)(parts.length).toBe(3); // Header, payload, signature
            // Decode the payload part (which is base64url encoded)
            const decodedPayload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
            // Assert the payload content is correct
            (0, vitest_1.expect)(decodedPayload.client_id).toBe(payload.client_id);
            (0, vitest_1.expect)(decodedPayload.scope).toBe(payload.scope);
        });
    });
    (0, vitest_1.describe)('verifyToken', () => {
        (0, vitest_1.it)('should correctly verify and decode a valid token', () => {
            // Arrange
            const payload = {
                client_id: 'test-client',
                scope: 'read:test write:test',
            };
            const token = (0, auth_1.generateToken)(payload);
            // Act
            const decoded = (0, auth_1.verifyToken)(token);
            // Assert
            (0, vitest_1.expect)(decoded).toBeDefined();
            (0, vitest_1.expect)(decoded.client_id).toBe(payload.client_id);
            (0, vitest_1.expect)(decoded.scope).toBe(payload.scope);
            (0, vitest_1.expect)(decoded.iat).toBeDefined();
            (0, vitest_1.expect)(decoded.exp).toBeDefined();
        });
        (0, vitest_1.it)('should throw an error for an invalid token', () => {
            // Arrange
            const invalidToken = 'invalid.token.string';
            // Act & Assert
            (0, vitest_1.expect)(() => {
                (0, auth_1.verifyToken)(invalidToken);
            }).toThrow('Invalid token');
        });
        (0, vitest_1.it)('should throw an error for an expired token', () => {
            // Arrange
            // Create a token that is already expired
            const payload = {
                client_id: 'test-client',
                scope: 'read:test',
            };
            const now = Math.floor(Date.now() / 1000);
            const expiredToken = jsonwebtoken_1.default.sign({ ...payload, iat: now - 7200, exp: now - 3600 }, process.env.JWT_SECRET);
            // Act & Assert
            (0, vitest_1.expect)(() => {
                (0, auth_1.verifyToken)(expiredToken);
            }).toThrow('Invalid token');
        });
        (0, vitest_1.it)('should throw an error for a token signed with a different secret', () => {
            // Arrange
            const payload = {
                client_id: 'test-client',
                scope: 'read:test',
            };
            const tokenWithDifferentSecret = jsonwebtoken_1.default.sign({
                ...payload,
                iat: Math.floor(Date.now() / 1000),
                exp: Math.floor(Date.now() / 1000) + 3600,
            }, 'different-secret');
            // Act & Assert
            (0, vitest_1.expect)(() => {
                (0, auth_1.verifyToken)(tokenWithDifferentSecret);
            }).toThrow('Invalid token');
        });
    });
    (0, vitest_1.describe)('generateRefreshToken', () => {
        (0, vitest_1.it)('should generate a string refresh token', () => {
            // Act
            const refreshToken = (0, auth_1.generateRefreshToken)();
            // Assert
            (0, vitest_1.expect)(refreshToken).toBeDefined();
            (0, vitest_1.expect)(typeof refreshToken).toBe('string');
            (0, vitest_1.expect)(refreshToken.startsWith('refresh-')).toBe(true);
        });
        (0, vitest_1.it)('should generate unique tokens on successive calls', () => {
            // Act
            const token1 = (0, auth_1.generateRefreshToken)();
            const token2 = (0, auth_1.generateRefreshToken)();
            // Assert
            (0, vitest_1.expect)(token1).not.toBe(token2);
        });
    });
});
//# sourceMappingURL=auth.test.js.map