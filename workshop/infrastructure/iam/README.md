# Identity and Access Management (IAM) Service

This service handles authentication and authorization for all city services in the API-First City project.

## Features

- User authentication with JWT tokens
- Token verification middleware
- Refresh token management
- Integration with other microservices

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

The service uses Vitest for testing. See the [testing documentation](./test/README.md) for details.

```bash
# Run all tests
yarn test

# Run tests with coverage
yarn test:coverage

# Run tests in watch mode
yarn test:watch

# Run tests with UI
yarn test:ui
```

## Environment Variables

Create a `.env` file in the root of the service with the following variables:

```
PORT=3000
JWT_SECRET=your_jwt_secret
TOKEN_EXPIRATION=1h
REFRESH_TOKEN_EXPIRATION=7d
```

## Project Structure

```
src/
  ├── auth.ts        # Authentication utilities
  ├── middleware.ts  # Express middlewares
  ├── server.ts      # Express server setup
  └── index.ts       # Entry point
test/
  ├── __mocks__/     # Test mocks
  ├── unit/          # Unit tests
  ├── integration/   # Integration tests
  └── README.md      # Testing documentation
dist/                # Compiled output
```
