# IAM Service Tests

This directory contains tests for the IAM (Identity and Access Management) service used in the API-First City Workshop.

## Test Structure

The tests are organized into the following categories:

1. **Unit Tests** - Testing individual functions and components

   - `auth.test.ts`: Tests for the authentication utilities (token generation, verification)
   - `middleware.test.ts`: Tests for middleware functions

2. **Integration Tests** - Testing endpoint interactions

   - `server.test.ts`: Tests for the server endpoints with mocked dependencies
   - `integration.test.ts`: End-to-end tests with actual implementations

3. **Setup Files**
   - `vitest.setup.ts`: Global test setup and configuration
   - `__mocks__/@city-services/common.ts`: Mocks for common package dependencies

## Running Tests

You can run the tests using the following commands:

```bash
# Run all tests
yarn test

# Run tests with coverage report
yarn test:coverage

# Run tests in watch mode (useful during development)
yarn test:watch
```

## Coverage Requirements

The tests maintain the following coverage thresholds:

- Statements: 80%
- Branches: 75%
- Functions: 80%
- Lines: 80%

## Using Vitest

This project uses Vitest for testing, which provides:

1. **Fast Execution**: Vitest is built on top of Vite and offers faster test runs
2. **Modern Architecture**: Uses the same configuration as your app (vitest.config.ts)
3. **ESM Support**: First-class support for ES Modules
4. **Watch Mode**: Efficient watch mode that updates tests instantly
5. **Native Code Coverage**: Built-in code coverage reporting via v8

### Configuration

The Vitest configuration is maintained in the `vitest.config.ts` file at the project root. This includes:

- Test environment settings
- File inclusion/exclusion patterns
- Coverage configuration
- Module resolution and aliasing

## Mocking Strategy

1. **Module Mocking**: Vitest's `vi.mock()` is used to mock modules
2. **Spy Functions**: `vi.fn()` creates function spies to track calls
3. **Environment Variables**: Managed in the `beforeEach` and `afterEach` hooks
4. **Integration Testing**: The integration tests use dynamic imports to test real implementations

## Adding New Tests

When adding new functionality to the IAM service, please follow these guidelines:

1. Add unit tests for any new functions or utilities
2. Add integration tests for any new endpoints
3. Maintain the existing test structure
4. Ensure the tests cover both success and error cases

## Troubleshooting

If you encounter issues when running the tests:

1. Make sure you have installed all dependencies (`yarn install`)
2. Check that the test environment variables are properly set
3. Verify that the mocks are correctly configured
4. For ES Module issues, ensure imports have proper paths and file extensions where needed
