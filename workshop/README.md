# API First Workshop: City Services

This workshop provides a hands-on experience with API-first development using a "City Services" microservices architecture as a practical example.

## Workshop Overview

The workshop follows a build-up approach, where participants progressively implement and connect services that make up a city's digital infrastructure. You'll learn how to design APIs first, generate code from your specifications, implement business logic, and connect services together—all following API-first best practices.

## Project Structure

The workshop is organized into the following main directories:

```
workshop/
├── common/                    # Shared code across all services
│   ├── models/                # Shared data models
│   ├── errors/                # Error handling utilities
│   ├── logging/               # Logging infrastructure
│   ├── firebase/              # Firebase infrastructure
│   └── testing/               # Test utilities
├── infrastructure/            # Core infrastructure services
│   ├── api-gateway/           # API Gateway (Gravitee)
│   ├── iam/                   # Identity and Access Management
│   ├── service-registry/      # Service discovery
│   └── event-bus/             # Event bus setup
├── services/                  # City services
│   └── sample/                # Complete sample service (reference implementation)
├── deployment/                # Deployment configuration
│   ├── docker-compose.yml     # Local development setup
│   ├── kubernetes/            # K8s deployment manifests
│   └── scripts/               # Setup and utility scripts
└── exercises/                 # Workshop exercises
    └── ...
```

## Sample Service Deep Dive

The `services/sample` directory contains a complete reference implementation that showcases API-first principles. This serves as your guide to understanding the architecture and patterns used throughout the workshop.

### Sample Service Structure

```
services/sample/
├── api/                      # API specification
│   └── openapi.yaml         # OpenAPI 3.1 contract
├── src/                      # Source code
│   ├── generated/           # Auto-generated code from OpenAPI
│   │   ├── types.gen.ts     # TypeScript types based on API schemas
│   │   ├── zod.gen.ts       # Zod validation schemas
│   │   ├── client.gen.ts    # Fetch-based API client
│   │   ├── sdk.gen.ts       # Higher-level SDK for API access
│   │   └── ...              # Other generated files
│   ├── models/              # Domain models
│   ├── repositories/        # Data access layer
│   ├── services/            # Business logic layer
│   ├── controllers/         # HTTP request handlers
│   ├── middleware/          # Express middleware
│   ├── events/              # Event handling
│   ├── app.ts               # Express app setup
│   └── index.ts             # Main entry point
├── openapi-ts.config.ts     # OpenAPI code generation config
├── tsconfig.json            # TypeScript configuration
└── package.json             # Dependencies and scripts
```

### Key Components

#### API Contract (`api/openapi.yaml`)

The heart of the API-first approach. This OpenAPI specification defines:

- All endpoints with their paths and HTTP methods
- Request/response schemas
- Validation rules
- Error responses
- Authentication requirements

This contract serves as the single source of truth for the API and drives code generation.

#### Generated Code (`src/generated/`)

Automatically generated from the OpenAPI specification using `@hey-api/openapi-ts`:

- **types.gen.ts**: TypeScript interfaces and types for all API models
- **zod.gen.ts**: Runtime validation schemas using Zod
- **client.gen.ts**: Type-safe HTTP client for API consumers
- **sdk.gen.ts**: Higher-level SDK for more convenient API access

This generated code ensures consistency between your API contract and implementation.

#### Models (`src/models/`)

Domain models represent the core entities in the service. These typically extend or implement the interfaces from the generated types, adding any business logic methods and properties:

```typescript
// Example: src/models/resource.ts
import { Resource } from '../generated';

// Extend the generated type with additional methods or properties
export interface ResourceModel extends Resource {
  calculateSomething(): number;
}
```

#### Repositories (`src/repositories/`)

The data access layer responsible for CRUD operations on domain models:

```typescript
// Example: src/repositories/resource-repository.ts
export const ResourceRepository = {
  findAll(): Promise<Resource[]> { /* ... */ },
  findById(id: string): Promise<Resource | null> { /* ... */ },
  create(data: CreateResourceRequest): Promise<Resource> { /* ... */ },
  update(id: string, data: UpdateResourceRequest): Promise<Resource | null> { /* ... */ },
  delete(id: string): Promise<boolean> { /* ... */ }
};
```

Repositories abstract away the underlying data storage mechanism (Firebase in this sample).

#### Services (`src/services/`)

The business logic layer that coordinates operations across repositories and implements domain rules:

```typescript
// Example: src/services/resource-service.ts
export const ResourceService = {
  async getResources(filter?: FilterParams): Promise<Resource[]> {
    // Business logic for fetching resources with filtering
    const resources = await ResourceRepository.findAll();
    return filter ? resources.filter(/*...*/) : resources;
  },
  
  async createResource(data: unknown): Promise<Resource> {
    // Validate with Zod schema from generated code
    const validated = ResourceSchema.parse(data);
    // Additional business logic/validation
    return ResourceRepository.create(validated);
  }
};
```

Services ensure that business rules are enforced and use the generated Zod schemas for validation.

#### Controllers (`src/controllers/`)

Handle HTTP requests and responses, delegating business logic to services:

```typescript
// Example: src/controllers/resource-controller.ts
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const filter = req.query;
    const resources = await ResourceService.getResources(filter);
    res.json(resources);
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const newResource = await ResourceService.createResource(req.body);
    res.status(201).json(newResource);
  } catch (error) {
    next(error);
  }
});
```

Controllers focus on HTTP-specific concerns and delegate business logic to services.

#### OpenAPI Validation (`src/app.ts`)

The Express OpenAPI Validator middleware ensures all requests and responses conform to the API contract:

```typescript
// In app.ts
app.use(
  OpenAPIValidator.middleware({
    apiSpec: join(__dirname, '../api/openapi.yaml'),
    validateRequests: true,
    validateResponses: true
  })
);
```

This provides runtime validation that your implementation correctly follows the API specification.

#### Service Registry Integration

The sample service registers with the service registry to enable discovery by other services:

```typescript
// In index.ts
import { registryClient } from './clients/registry-client';

// When starting the service
app.listen(port, async () => {
  console.log(`Service running at http://localhost:${port}`);
  
  // Register with the service registry
  await registryClient.register();
});
```

This enables other services to discover and communicate with this service dynamically.

## API-First Workflow

The sample service demonstrates the complete API-first workflow:

1. **Design the API** in `api/openapi.yaml` first
2. **Generate code** using `npm run generate:api` (defined in package.json)
3. **Implement the service** using the generated types and validation
4. **Validate at runtime** using the OpenAPI validator middleware
5. **Document automatically** with Swagger UI at `/api-docs`

This workflow ensures consistency between your API contract and implementation.

## Getting Started

Follow these steps to set up the workshop environment:

1. Ensure you have the following prerequisites installed:

   - Node.js (v20+)
   - Docker and Docker Compose
   - kubectl (if using Kubernetes examples)
   - k3d (for local Kubernetes, if applicable)

2. Clone this repository and navigate to the workshop directory:

   ```bash
   git clone <repository-url>
   cd api-first-city/workshop
   ```

3. Install dependencies:

   ```bash
   npm install
   ```

4. Run the setup script:
   ```bash
   npm run setup
   ```

## Workshop Exercises

The workshop consists of several exercises, each building upon the previous one:

1. **API-First Basics**: Learn the principles of API-first development and define your first API contract
2. **Implementing Services**: Build a service implementation based on an API contract
3. **Service Integration**: Connect multiple services through the API gateway
4. **Event-Driven Communication**: Implement event-based communication between services
5. **Testing API-First Services**: Apply different testing strategies to ensure quality
6. **Deployment**: Deploy the complete city services ecosystem

Each exercise includes:

- Instructions and requirements
- Starter code (where applicable)
- Reference solutions

## Technologies

This workshop uses the following technologies:

- **TypeScript**: For type-safe coding
- **Express.js**: Web framework for API implementation
- **OpenAPI 3.1**: For API contract definition
- **@hey-api/openapi-ts**: Code generation from OpenAPI specifications
- **Zod**: Runtime validation library
- **Jest**: Testing framework
- **Docker & k3d**: For containerization and local Kubernetes
- **Gravitee**: API Gateway for routing and management
- **OAuth 2.0**: Authentication and authorization
- **Google Pub-Sub**: For event-based communication between services
- **Firebase**: Document database for services
- **Swagger UI**: For API documentation and exploration

## API Documentation

The sample service includes API documentation using Swagger UI, which provides an interactive interface for exploring and testing the API.

To access the API documentation:

1. Start the sample service:

   ```bash
   cd workshop/services/sample
   npm run dev
   ```

2. Open your browser and navigate to:
   ```
   http://localhost:3010/api-docs
   ```

This documentation is automatically generated from the OpenAPI specification located at `services/sample/api/openapi.yaml`. You can use the Swagger UI interface to:

- Explore available endpoints and models
- Read detailed API descriptions
- Try out API requests directly from the browser
- View request/response examples

## Modular Docker Compose Architecture

This project uses a modular Docker Compose architecture where:

1. Each service or infrastructure component has its own `docker-compose.yml` file in its directory
2. The main deployment combines these using Docker Compose's `extends` feature
3. This keeps service configuration close to the service code

### Running Services

You can run all services together using:

```bash
# From project root
cd workshop/deployment
docker-compose up

# Or use the convenience script
./scripts/docker-up.sh
```

Or run individual infrastructure components directly:

```bash
# Run just the event bus
cd workshop/infrastructure/event-bus
docker-compose up
```

## Environment Configuration

The project uses environment variables for configuring services. Each service has its own `.env` file with specific configurations.

### Setting Up Environment Variables

We provide a utility script to set up the initial environment configuration:

```bash
# From the project root
yarn setup-env
```

### Port Allocation

By default, services use the following ports:

| Service            | Internal Port | External Port |
| ------------------ | ------------- | ------------- |
| IAM                | 3000          | 3001          |
| Service Registry   | 3000          | 3002          |
| Event Bus (PubSub) | 8085          | 8085          |
| Sample Service     | 3000          | 3010          |
| API Gateway        | (multiple)    | (multiple)    |

## License

This project is licensed under the MIT License - see the LICENSE file for details.
