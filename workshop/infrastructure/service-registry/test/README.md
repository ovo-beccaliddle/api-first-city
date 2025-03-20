# Service Registry Tests

This directory contains tests for the Service Registry service used in the API-First City Workshop.

## Test Structure

The tests are organized into the following categories:

1. **Unit Tests** - Testing individual components

   - `registry.test.ts`: Tests for the ServiceRegistry class implementation
   - `client.test.ts`: Tests for the ServiceRegistryClient class

2. **API and Integration Tests**

   - `server.test.ts`: Tests for the server API endpoints
   - `integration.test.ts`: Tests for server and client integration

3. **Setup Files**
   - `vitest.setup.ts`: Global test setup and configuration
   - `__mocks__/@city-services/common.ts`: Mocks for common package dependencies

## Running Tests

You can run the tests using the following commands:

```bash
# Run all tests
yarn test

# Run tests in watch mode (useful during development)
yarn test:watch

# Run tests with UI
yarn test:ui
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
5. **Testing UI**: Visual interface for exploring and debugging tests

### Configuration

The Vitest configuration is maintained in the `vitest.config.ts` file at the project root. This includes:

- Test environment settings
- File inclusion/exclusion patterns
- Coverage configuration
- Module resolution and aliasing

## Mocking Strategy

1. **Module Mocking**: Vitest's `vi.mock()` is used to mock modules
2. **Spy Functions**: `vi.fn()` and `vi.spyOn()` create function spies to track calls
3. **Time Control**: `Date.now()` mocking for consistent time-based tests
4. **Network Mocking**: The `fetch` API is mocked for client tests
5. **Registry State**: Tests interact with a real registry instance but clean it between tests

## Adding New Tests

When adding new functionality to the Service Registry, please follow these guidelines:

1. Add unit tests for any new functions or classes
2. Add API tests for any new endpoints
3. Add integration tests for any new client-server interactions
4. Maintain the existing test structure
5. Ensure the tests cover both success and error cases

## Troubleshooting

If you encounter issues when running the tests:

1. Make sure you have installed all dependencies (`yarn install`)
2. Check that the test environment variables are properly set
3. Verify that the mocks are correctly configured
4. For time-sensitive tests, ensure proper usage of Date.now() mocking
