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
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const vitest_1 = require("vitest");
// Import directly from source for integration tests (no mocking)
// We'll use the actual implementation to test integration scenarios
(0, vitest_1.describe)('IAM Service Integration Tests', () => {
    let app;
    let mockJwtSecret;
    (0, vitest_1.beforeAll)(async () => {
        // Setup environment for tests
        mockJwtSecret = 'integration-test-secret';
        process.env.JWT_SECRET = mockJwtSecret;
        process.env.PORT = '3000';
        // Import the actual server (not mocked)
        const serverModule = await Promise.resolve().then(() => __importStar(require('../src/server')));
        app = serverModule.default;
    });
    (0, vitest_1.describe)('Client Credentials Flow', () => {
        (0, vitest_1.it)('should complete a full OAuth client credentials flow', async () => {
            // Step 1: Get a token
            const tokenResponse = await (0, supertest_1.default)(app).post('/oauth/token').send({
                client_id: 'sample-service',
                client_secret: 'sample-service-secret',
                grant_type: 'client_credentials',
                scope: 'read:sample write:sample',
            });
            (0, vitest_1.expect)(tokenResponse.status).toBe(200);
            (0, vitest_1.expect)(tokenResponse.body).toHaveProperty('access_token');
            (0, vitest_1.expect)(tokenResponse.body.token_type).toBe('bearer');
            (0, vitest_1.expect)(tokenResponse.body.scope).toBe('read:sample write:sample');
            const accessToken = tokenResponse.body.access_token;
            // Step 2: Introspect the token
            const introspectResponse = await (0, supertest_1.default)(app)
                .post('/oauth/introspect')
                .send({ token: accessToken });
            (0, vitest_1.expect)(introspectResponse.status).toBe(200);
            (0, vitest_1.expect)(introspectResponse.body.active).toBe(true);
            (0, vitest_1.expect)(introspectResponse.body.client_id).toBe('sample-service');
            (0, vitest_1.expect)(introspectResponse.body.scope).toBe('read:sample write:sample');
            // Step 3: Verify token directly (simulating API Gateway validation)
            const decodedToken = jsonwebtoken_1.default.verify(accessToken, mockJwtSecret);
            (0, vitest_1.expect)(decodedToken.client_id).toBe('sample-service');
            (0, vitest_1.expect)(decodedToken.scope).toBe('read:sample write:sample');
        });
        (0, vitest_1.it)('should handle cross-service scopes based on client permissions', async () => {
            // Get token for emergency-police-service
            const policeTokenResponse = await (0, supertest_1.default)(app).post('/oauth/token').send({
                client_id: 'emergency-police-service',
                client_secret: 'police-service-secret',
                grant_type: 'client_credentials',
                scope: 'read:incidents write:incidents read:emergency',
            });
            (0, vitest_1.expect)(policeTokenResponse.status).toBe(200);
            (0, vitest_1.expect)(policeTokenResponse.body.scope).toBe('read:incidents write:incidents read:emergency');
            // Try to get token with unauthorized scope
            const unauthorizedScopeResponse = await (0, supertest_1.default)(app).post('/oauth/token').send({
                client_id: 'emergency-police-service',
                client_secret: 'police-service-secret',
                grant_type: 'client_credentials',
                scope: 'read:incidents write:emergencies', // police service can't write emergencies
            });
            (0, vitest_1.expect)(unauthorizedScopeResponse.status).toBe(200);
            (0, vitest_1.expect)(unauthorizedScopeResponse.body.scope).toBe('read:incidents');
            (0, vitest_1.expect)(unauthorizedScopeResponse.body.scope).not.toContain('write:emergencies');
        });
    });
    (0, vitest_1.describe)('Multi-Service Integration', () => {
        (0, vitest_1.it)('should support different scopes for different city services', async () => {
            // Test police service
            const policeResponse = await (0, supertest_1.default)(app).post('/oauth/token').send({
                client_id: 'emergency-police-service',
                client_secret: 'police-service-secret',
                grant_type: 'client_credentials',
                scope: 'read:incidents write:incidents',
            });
            (0, vitest_1.expect)(policeResponse.status).toBe(200);
            (0, vitest_1.expect)(policeResponse.body).toHaveProperty('access_token');
            (0, vitest_1.expect)(policeResponse.body.scope).toBe('read:incidents write:incidents');
            // Test water service
            const waterResponse = await (0, supertest_1.default)(app).post('/oauth/token').send({
                client_id: 'utilities-water-service',
                client_secret: 'water-service-secret',
                grant_type: 'client_credentials',
                scope: 'read:usage read:outages',
            });
            (0, vitest_1.expect)(waterResponse.status).toBe(200);
            (0, vitest_1.expect)(waterResponse.body).toHaveProperty('access_token');
            (0, vitest_1.expect)(waterResponse.body.scope).toBe('read:usage read:outages');
            // Verify introspection works with police token
            const policeIntrospection = await (0, supertest_1.default)(app)
                .post('/oauth/introspect')
                .send({ token: policeResponse.body.access_token });
            (0, vitest_1.expect)(policeIntrospection.body.active).toBe(true);
            (0, vitest_1.expect)(policeIntrospection.body.client_id).toBe('emergency-police-service');
            (0, vitest_1.expect)(policeIntrospection.body.scope).toBe('read:incidents write:incidents');
        });
    });
    (0, vitest_1.describe)('Error Handling', () => {
        (0, vitest_1.it)('should handle a complete error scenario gracefully', async () => {
            // Step 1: Try with invalid client credentials
            const invalidClientResponse = await (0, supertest_1.default)(app).post('/oauth/token').send({
                client_id: 'fake-service',
                client_secret: 'wrong-secret',
                grant_type: 'client_credentials',
                scope: 'read:fake',
            });
            (0, vitest_1.expect)(invalidClientResponse.status).toBe(401);
            // Step 2: Try with invalid grant type
            const invalidGrantResponse = await (0, supertest_1.default)(app).post('/oauth/token').send({
                client_id: 'sample-service',
                client_secret: 'sample-service-secret',
                grant_type: 'authorization_code',
                scope: 'read:sample',
            });
            (0, vitest_1.expect)(invalidGrantResponse.status).toBe(400);
            (0, vitest_1.expect)(invalidGrantResponse.body.error).toBe('unsupported_grant_type');
            // Step 3: Introspect an invalid token
            const invalidTokenIntrospection = await (0, supertest_1.default)(app)
                .post('/oauth/introspect')
                .send({ token: 'invalid-token-string' });
            (0, vitest_1.expect)(invalidTokenIntrospection.status).toBe(200);
            (0, vitest_1.expect)(invalidTokenIntrospection.body.active).toBe(false);
        });
    });
});
//# sourceMappingURL=integration.test.js.map