# Service Registry

This service provides service discovery and registration for all microservices in the API-First City project.

## Features

- Service registration and discovery
- Health monitoring with heartbeats
- Service metadata management
- Client library for easy integration
- Comprehensive test suite

## Getting Started

### Prerequisites

- Node.js 18+
- Yarn

### Installation

```bash
yarn install
```

### Development

```bash
yarn dev
```

### Build

```bash
yarn build
```

### Running

```bash
yarn start
```

## Testing

This service uses Vitest for comprehensive testing. See the [testing documentation](./test/README.md) for details.

```bash
# Run all tests
yarn test

# Run tests in watch mode
yarn test:watch

# Run tests with UI
yarn test:ui
```

## Environment Variables

Create a `.env` file in the root of the service with the following variables:

```
PORT=3000
NODE_ENV=development
```

## Project Structure

```
src/
  ├── client.ts      # Service Registry client for other services
  ├── server.ts      # Express server and API endpoints
  └── index.ts       # Entry point and exports
test/
  ├── __mocks__/     # Test mocks
  ├── server.test.ts # API tests
  ├── client.test.ts # Client library tests
  ├── registry.test.ts # Service Registry class tests
  ├── integration.test.ts # Integration tests
  └── README.md      # Testing documentation
dist/                # Compiled output
```

## API Endpoints

- `POST /register` - Register a new service
- `GET /services` - List all registered services
- `GET /services/:name` - Get details for a specific service
- `PUT /services/:name` - Update a service's details
- `DELETE /services/:name` - Remove a service
- `POST /heartbeat/:name` - Record a heartbeat for a service
- `GET /health` - Service health check

## Client Library

The client library is exported from this package and can be used by other services to interact with the registry:

```typescript
import { ServiceRegistryClient } from '@city-services/service-registry';

const client = new ServiceRegistryClient({
  registryUrl: 'http://service-registry:3000',
  serviceName: 'my-service',
  serviceUrl: 'http://my-service:8080',
  healthCheckUrl: 'http://my-service:8080/health',
  metadata: { version: '1.0.0' },
});

// Register the service
await client.register();

// Discover another service
const otherService = await client.discover('other-service');
```

## Testing Metrics

This service has a comprehensive test suite with:

- 43 tests across 4 test files
- Unit tests for core functionality
- Integration tests for API endpoints
- Client and server interaction tests
