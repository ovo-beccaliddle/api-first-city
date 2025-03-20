// Setup global testing environment
import 'jest';

// Mock environment variables
process.env.JWT_SECRET = 'test-secret-key';
process.env.TOKEN_EXPIRATION = '3600';
process.env.TOKEN_ISSUER = 'test-issuer';
process.env.NODE_ENV = 'test';
process.env.PORT = '3000';
process.env.LOG_LEVEL = 'error'; // Reduce logging noise during tests

// Global setup
beforeAll(() => {
  // Any global setup for all tests
  console.log('Setting up test environment for IAM service tests');
});

// Global teardown
afterAll(() => {
  // Cleanup after all tests
  console.log('Tearing down test environment for IAM service tests');
});
