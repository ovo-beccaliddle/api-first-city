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
const auth_1 = require("../src/auth");
// Mock the auth module
vitest_1.vi.mock('../src/auth', () => {
    return {
        generateToken: vitest_1.vi.fn(),
        verifyToken: vitest_1.vi.fn(),
    };
});
// Mock the common module
vitest_1.vi.mock('@city-services/common', () => {
    return {
        errorHandler: vitest_1.vi.fn((err, req, res, next) => next(err)),
        requestLogger: vitest_1.vi.fn(() => (req, res, next) => next()),
    };
});
(0, vitest_1.describe)('IAM Server', () => {
    let app;
    (0, vitest_1.beforeAll)(async () => {
        // Save original env vars
        process.env.JWT_SECRET = 'test-secret';
        process.env.PORT = '3000';
        // Clear mocks
        vitest_1.vi.clearAllMocks();
        // Dynamic import for better compatibility
        const serverModule = await Promise.resolve().then(() => __importStar(require('../src/server')));
        app = serverModule.default;
    });
    (0, vitest_1.describe)('Health Check Endpoint', () => {
        (0, vitest_1.it)('should return 200 OK status with correct response', async () => {
            const response = await (0, supertest_1.default)(app).get('/health');
            (0, vitest_1.expect)(response.status).toBe(200);
            (0, vitest_1.expect)(response.body).toEqual({ status: 'ok' });
        });
    });
    (0, vitest_1.describe)('OAuth Token Endpoint', () => {
        (0, vitest_1.beforeEach)(() => {
            // Reset mocks before each test
            vitest_1.vi.resetAllMocks();
        });
        (0, vitest_1.it)('should return access token for valid client credentials', async () => {
            // Mock generateToken to return a predictable value
            vitest_1.vi.mocked(auth_1.generateToken).mockReturnValue('mock-token-123');
            const response = await (0, supertest_1.default)(app).post('/oauth/token').send({
                client_id: 'sample-service',
                client_secret: 'sample-service-secret',
                grant_type: 'client_credentials',
                scope: 'read:sample write:sample',
            });
            (0, vitest_1.expect)(response.status).toBe(200);
            (0, vitest_1.expect)(response.body).toMatchObject({
                access_token: 'mock-token-123',
                token_type: 'bearer',
                expires_in: 3600,
                scope: 'read:sample write:sample',
            });
            // Verify the generateToken was called with the right arguments
            (0, vitest_1.expect)(auth_1.generateToken).toHaveBeenCalledWith({
                client_id: 'sample-service',
                scope: 'read:sample write:sample',
            });
        });
        (0, vitest_1.it)('should return 400 if missing client credentials', async () => {
            const response = await (0, supertest_1.default)(app).post('/oauth/token').send({
                grant_type: 'client_credentials',
                scope: 'read:sample',
            });
            (0, vitest_1.expect)(response.status).toBe(400);
            (0, vitest_1.expect)(response.body).toMatchObject({
                error: 'invalid_request',
                error_description: vitest_1.expect.stringContaining('Missing client credentials'),
            });
        });
        (0, vitest_1.it)('should return 400 if grant type is not client_credentials', async () => {
            const response = await (0, supertest_1.default)(app).post('/oauth/token').send({
                client_id: 'sample-service',
                client_secret: 'sample-service-secret',
                grant_type: 'password',
                scope: 'read:sample',
            });
            (0, vitest_1.expect)(response.status).toBe(400);
            (0, vitest_1.expect)(response.body).toMatchObject({
                error: 'unsupported_grant_type',
                error_description: vitest_1.expect.stringContaining('Only client_credentials grant type is supported'),
            });
        });
        (0, vitest_1.it)('should return 401 if client credentials are invalid', async () => {
            const response = await (0, supertest_1.default)(app).post('/oauth/token').send({
                client_id: 'sample-service',
                client_secret: 'wrong-secret',
                grant_type: 'client_credentials',
                scope: 'read:sample',
            });
            (0, vitest_1.expect)(response.status).toBe(401);
            (0, vitest_1.expect)(response.body).toMatchObject({
                error: 'invalid_client',
                error_description: vitest_1.expect.stringContaining('Invalid client credentials'),
            });
        });
        (0, vitest_1.it)('should return 400 if no valid scopes are requested', async () => {
            const response = await (0, supertest_1.default)(app).post('/oauth/token').send({
                client_id: 'sample-service',
                client_secret: 'sample-service-secret',
                grant_type: 'client_credentials',
                scope: 'invalid:scope',
            });
            (0, vitest_1.expect)(response.status).toBe(400);
            (0, vitest_1.expect)(response.body).toMatchObject({
                error: 'invalid_scope',
                error_description: vitest_1.expect.stringContaining('No valid scopes requested'),
            });
        });
        (0, vitest_1.it)('should only grant allowed scopes for the client', async () => {
            // Mock generateToken to return a predictable value
            vitest_1.vi.mocked(auth_1.generateToken).mockReturnValue('mock-token-456');
            const response = await (0, supertest_1.default)(app).post('/oauth/token').send({
                client_id: 'sample-service',
                client_secret: 'sample-service-secret',
                grant_type: 'client_credentials',
                scope: 'read:sample invalid:scope',
            });
            (0, vitest_1.expect)(response.status).toBe(200);
            (0, vitest_1.expect)(response.body).toMatchObject({
                access_token: 'mock-token-456',
                scope: 'read:sample', // Only the valid scope is included
            });
            // Verify generateToken was called with only the allowed scope
            (0, vitest_1.expect)(auth_1.generateToken).toHaveBeenCalledWith({
                client_id: 'sample-service',
                scope: 'read:sample',
            });
        });
    });
    (0, vitest_1.describe)('Token Introspection Endpoint', () => {
        (0, vitest_1.beforeEach)(() => {
            vitest_1.vi.resetAllMocks();
        });
        (0, vitest_1.it)('should return active=true with token info for valid token', async () => {
            // Mock verifyToken to return decoded token
            vitest_1.vi.mocked(auth_1.verifyToken).mockReturnValue({
                client_id: 'sample-service',
                scope: 'read:sample',
                exp: Math.floor(Date.now() / 1000) + 3600,
            });
            const response = await (0, supertest_1.default)(app).post('/oauth/introspect').send({
                token: 'valid-token',
            });
            (0, vitest_1.expect)(response.status).toBe(200);
            (0, vitest_1.expect)(response.body).toMatchObject({
                active: true,
                client_id: 'sample-service',
                scope: 'read:sample',
                exp: vitest_1.expect.any(Number),
            });
            // Verify verifyToken was called with the right token
            (0, vitest_1.expect)(auth_1.verifyToken).toHaveBeenCalledWith('valid-token');
        });
        (0, vitest_1.it)('should return active=false for invalid token', async () => {
            // Mock verifyToken to throw an error
            vitest_1.vi.mocked(auth_1.verifyToken).mockImplementation(() => {
                throw new Error('Invalid token');
            });
            const response = await (0, supertest_1.default)(app).post('/oauth/introspect').send({
                token: 'invalid-token',
            });
            (0, vitest_1.expect)(response.status).toBe(200);
            (0, vitest_1.expect)(response.body).toEqual({ active: false });
            // Verify verifyToken was called
            (0, vitest_1.expect)(auth_1.verifyToken).toHaveBeenCalledWith('invalid-token');
        });
        (0, vitest_1.it)('should return 400 if token is missing', async () => {
            const response = await (0, supertest_1.default)(app).post('/oauth/introspect').send({});
            (0, vitest_1.expect)(response.status).toBe(400);
            (0, vitest_1.expect)(response.body).toMatchObject({
                error: 'invalid_request',
                error_description: vitest_1.expect.stringContaining('Missing token parameter'),
            });
        });
    });
    (0, vitest_1.describe)('JWKS Endpoint', () => {
        (0, vitest_1.it)('should return a JWKS with mock key information', async () => {
            const response = await (0, supertest_1.default)(app).get('/.well-known/jwks.json');
            (0, vitest_1.expect)(response.status).toBe(200);
            (0, vitest_1.expect)(response.body).toHaveProperty('keys');
            (0, vitest_1.expect)(response.body.keys).toBeInstanceOf(Array);
            (0, vitest_1.expect)(response.body.keys.length).toBeGreaterThan(0);
            // Verify the key structure
            const key = response.body.keys[0];
            (0, vitest_1.expect)(key).toMatchObject({
                kty: 'RSA',
                kid: vitest_1.expect.any(String),
                use: 'sig',
                alg: 'RS256',
            });
        });
    });
});
//# sourceMappingURL=server.test.js.map