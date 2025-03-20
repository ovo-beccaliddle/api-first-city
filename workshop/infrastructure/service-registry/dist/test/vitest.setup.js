"use strict";
// Global setup for all tests
console.log('Setting up test environment for Service Registry tests');
// Set up environment variables for testing
process.env.PORT = '3001';
// Global teardown
globalThis.afterAll(() => {
    console.log('Tearing down test environment for Service Registry tests');
});
//# sourceMappingURL=vitest.setup.js.map