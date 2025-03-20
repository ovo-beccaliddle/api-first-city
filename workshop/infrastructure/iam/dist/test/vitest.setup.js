"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Setup global testing environment
const vitest_1 = require("vitest");
// Mock environment variables
process.env.JWT_SECRET = 'test-secret-key';
process.env.TOKEN_EXPIRATION = '3600';
process.env.TOKEN_ISSUER = 'test-issuer';
process.env.NODE_ENV = 'test';
process.env.PORT = '3000';
process.env.LOG_LEVEL = 'error'; // Reduce logging noise during tests
// Global setup
(0, vitest_1.beforeAll)(() => {
    // Any global setup for all tests
    console.log('Setting up test environment for IAM service tests');
});
// Global teardown
(0, vitest_1.afterAll)(() => {
    // Cleanup after all tests
    console.log('Tearing down test environment for IAM service tests');
});
//# sourceMappingURL=vitest.setup.js.map