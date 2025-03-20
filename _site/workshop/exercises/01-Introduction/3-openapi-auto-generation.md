# Leveraging OpenAPI for Code Generation

Now that we've built and tested our service, let's explore one of the most powerful aspects of the API-first approach: automatically generating code from your OpenAPI specification. This capability significantly accelerates development, ensures consistency between your API contract and implementation, and reduces the chance of errors.

## The Power of Code Generation

When you design your API with OpenAPI, you're not just creating documentation - you're creating a machine-readable specification that can be used to generate:

- **Type definitions**: Ensuring type safety throughout your application
- **API clients**: For easy consumption of your service by other services
- **Server stubs**: Providing structure for your implementation
- **Validation schemas**: For request and response validation
- **Documentation**: Interactive API documentation for developers

Automating these aspects of development lets you focus on implementing business logic rather than boilerplate code, and it ensures that your implementation always matches your API contract.

## Code Generation with @hey-api/openapi-ts

In our sample service, we're using `@hey-api/openapi-ts` to generate TypeScript types, clients, and validation schemas from our OpenAPI specification. This is a powerful tool that integrates well with TypeScript projects and offers several advantages over other libraries:

- **Comprehensive output**: Generates not just types, but also clients, validation schemas, and more
- **Plugin architecture**: Highly customizable through a plugin system
- **TypeScript-first**: Built specifically for TypeScript ecosystems
- **Type-safe clients**: Generates fully typed API clients
- **Integration with popular libraries**: Built-in support for Zod, React, and more
- **Developer experience**: Clean output with minimal boilerplate

### Setting Up OpenAPI Code Generation

Let's walk through how to set up code generation for your city service:

#### 1. Install the Required Dependencies

First, add the necessary dependencies to your project:

```bash
cd services/your-service-name
npm install --save-dev @hey-api/openapi-ts @hey-api/client-fetch zod
```

This installs:
- `@hey-api/openapi-ts`: The core code generation tool
- `@hey-api/client-fetch`: A plugin for generating fetch-based API clients
- `zod`: A TypeScript-first schema validation library

#### 2. Create a Configuration File

Create a configuration file for `@hey-api/openapi-ts` in your service directory:

```bash
touch services/your-service-name/openapi-ts.config.ts
```

Add the following configuration:

```typescript
import { defineConfig, defaultPlugins } from '@hey-api/openapi-ts';

export default defineConfig({
  input: 'api/openapi.yaml', // Path to your OpenAPI specification
  output: 'src/generated',   // Where to output generated files
  plugins: [
    ...defaultPlugins,
    '@hey-api/client-fetch', // Generates fetch-based API clients
    'zod',                   // Generates Zod validation schemas
    {
      enums: 'javascript',   // How to generate enums
      name: '@hey-api/typescript',
    },
    {
      name: '@hey-api/schemas',
      type: 'json',          // Output schema format
    },
    {
      name: '@hey-api/transformers',
      dates: true            // Transform date strings to Date objects
    }
  ]
});
```

This configuration tells the generator where to find your OpenAPI specification, where to output the generated files, and which plugins to use for generating different types of code.

#### 3. Add a Generate Script

Add a script to your `package.json` to run the code generation:

```json
"scripts": {
  "generate:api": "openapi-ts",
  "build": "yarn generate:api && tsc -p tsconfig.json"
}
```

With this setup, you can run `npm run generate:api` to generate code from your OpenAPI specification, and it will automatically run as part of your build process.

### What Gets Generated

When you run the code generation, you'll see several files appear in your `src/generated` directory:

- **types.gen.ts**: TypeScript interfaces and types for your API models
- **zod.gen.ts**: Zod schemas for validating requests and responses
- **client.gen.ts**: A fetch-based API client for consuming your service
- **sdk.gen.ts**: A higher-level SDK for working with your API
- **schemas.gen.ts**: JSON schemas for your API models
- **transformers.gen.ts**: Utility functions for transforming data
- **index.ts**: A barrel file that exports all the generated types

Each of these files serves a specific purpose in making your API easier to work with. Let's explore some of the key files in more detail:

#### types.gen.ts

This file contains TypeScript definitions for all the models defined in your OpenAPI specification. These types are fully compatible with TypeScript's type system and provide excellent IDE support.

```typescript
// Example of a generated type
export interface Patrol {
  id: string;
  type: PatrolType;
  status: PatrolStatus;
  location: GeoLocation;
  officerCount: number;
  activeCall?: string;
  lastUpdated: string;
}

export enum PatrolType {
  CAR = 'CAR',
  MOTORCYCLE = 'MOTORCYCLE',
  BIKE = 'BIKE',
  FOOT = 'FOOT'
}

export enum PatrolStatus {
  AVAILABLE = 'AVAILABLE',
  BUSY = 'BUSY',
  OUT_OF_SERVICE = 'OUT_OF_SERVICE'
}
```

#### zod.gen.ts

This file contains Zod schemas that correspond to your API models. These schemas provide runtime validation that matches the constraints defined in your OpenAPI specification.

```typescript
// Example of a generated Zod schema
export const PatrolSchema = z.object({
  id: z.string(),
  type: z.enum(['CAR', 'MOTORCYCLE', 'BIKE', 'FOOT']),
  status: z.enum(['AVAILABLE', 'BUSY', 'OUT_OF_SERVICE']),
  location: z.object({
    latitude: z.number(),
    longitude: z.number()
  }),
  officerCount: z.number().int().min(1),
  activeCall: z.string().optional(),
  lastUpdated: z.string().datetime()
});
```

#### client.gen.ts and sdk.gen.ts

These files provide type-safe ways to interact with your API. The client is a lower-level interface that maps directly to your API endpoints, while the SDK provides a more user-friendly interface.

```typescript
// Example of using the generated client
const client = createClient({
  baseUrl: 'http://localhost:3000'
});

// Type-safe API calls
const patrols = await client.listPatrols();
const nearestPatrol = await client.findNearestPatrol({
  params: {
    latitude: 40.7128,
    longitude: -74.0060
  }
});
```

### Using the Generated Code

Let's look at how to use the generated code in your service implementation:

#### 1. Import Types in Your Models

Instead of manually defining types, import them from the generated code:

```typescript
// src/models/patrol.ts
import { Patrol, PatrolStatus, PatrolType } from '../generated';

// You can now use these types throughout your service
```

#### 2. Use Zod Schemas for Validation

The generated Zod schemas provide runtime validation:

```typescript
// src/services/patrol-service.ts
import { PatrolSchema } from '../generated/zod.gen';

export const PatrolService = {
  createPatrol(data: unknown): Patrol {
    // Validate the input data against the schema
    const validatedData = PatrolSchema.parse(data);
    
    // If validation passes, proceed with creating the patrol
    return PatrolRepository.create(validatedData);
  }
};
```

#### 3. Use the Generated Client in Other Services

Other services can use the generated client to communicate with your service:

```typescript
// In another service that needs to call your service
import { createClient } from '@city-services/police-service/src/generated';

// Create a client for the police service
const policeServiceClient = createClient({
  baseUrl: 'http://localhost:3000' // Or get from service registry
});

// Use the client to make API calls
const availablePatrols = await policeServiceClient.getAvailablePatrols();
```

This provides a type-safe way for services to communicate with each other.

## Integrating with Express OpenAPI Validator

We've already set up Express OpenAPI Validator in our service, and it works perfectly with our generated code. The validator ensures that requests and responses conform to our API specification at runtime, while the generated types ensure type safety at compile time.

```typescript
// app.ts
import { OpenAPIValidator } from 'express-openapi-validator';
import { join } from 'path';

// ...

app.use(
  OpenAPIValidator.middleware({
    apiSpec: join(__dirname, '../api/openapi.yaml'),
    validateRequests: true,
    validateResponses: true
  })
);
```

With this setup, any request or response that doesn't match your API specification will be rejected with a helpful error message.

## Benefits of Auto-Generation

Using code generation from your OpenAPI specification offers numerous benefits:

1. **Type Safety**: Catch errors at compile time rather than runtime
2. **Consistency**: Ensure your implementation matches your API contract
3. **Productivity**: Focus on business logic instead of boilerplate
4. **Documentation**: Generated code serves as living documentation
5. **Maintainability**: Change your API spec and regenerate code to update everything
6. **Developer Experience**: Better IDE support with autocomplete and type hints
7. **Cross-Service Communication**: Standardized, type-safe way for services to communicate

## Alternative Libraries

While we're using `@hey-api/openapi-ts` in our sample project, there are several other libraries available for generating code from OpenAPI specifications:

- **openapi-generator**: A comprehensive tool that supports multiple languages and frameworks, but has a steeper learning curve
- **swagger-codegen**: The original code generator from Swagger (now OpenAPI), with broad language support but less modern TypeScript support
- **oazapfts**: A TypeScript-focused generator with minimal dependencies, good for simple projects
- **openapi-typescript**: Generates TypeScript types from OpenAPI specifications, focused only on types rather than clients
- **orval**: Generates TypeScript clients with React Query or SWR integration, excellent for frontend applications

Each tool has its strengths:

| Tool | Languages | Client Generation | Schema Validation | TypeScript Integration | Learning Curve |
|------|-----------|-------------------|------------------|------------------------|---------------|
| @hey-api/openapi-ts | TypeScript | Yes | Yes (Zod) | Excellent | Moderate |
| openapi-generator | Many | Yes | Varies by language | Good | Steep |
| swagger-codegen | Many | Yes | Varies by language | Basic | Steep |
| oazapfts | TypeScript | Yes | No | Good | Low |
| openapi-typescript | TypeScript | No | No | Good | Low |
| orval | TypeScript | Yes | No | Good | Moderate |

The best choice depends on your specific needs and technology stack. If you're working in a TypeScript ecosystem and want a comprehensive solution, `@hey-api/openapi-ts` is an excellent choice. For multi-language support, `openapi-generator` might be better. For frontend applications using React, `orval` could be more suitable.

## Best Practices for Code Generation

To get the most out of OpenAPI code generation, follow these best practices:

1. **Keep Your API Specification as the Source of Truth**: Always update your OpenAPI specification first, then regenerate code.

2. **Don't Modify Generated Files**: Treat generated files as read-only. If you need to customize behavior, extend the generated types rather than modifying them.

3. **Version Your API Specification**: Use semantic versioning for your API to manage changes.

4. **Include Generation in Your Build Process**: Ensure fresh code is generated with each build.

5. **Write Tests Against Generated Types**: This ensures your implementation correctly uses the generated code.

6. **Document Customization Points**: Note where you've extended or customized generated behavior.

7. **Provide Generated Clients to API Consumers**: Make it easy for other services to consume your API by sharing your generated clients.

## Example: Updating Your Service

Let's say you want to add a new endpoint to your patrol service. Here's the workflow:

1. **Update Your OpenAPI Specification**:

```yaml
# api/openapi.yaml
paths:
  # ... existing paths
  /patrols/shifts:
    get:
      summary: Get patrol shift schedule
      operationId: getPatrolShifts
      responses:
        '200':
          description: Shift schedule
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ShiftSchedule'

components:
  schemas:
    # ... existing schemas
    ShiftSchedule:
      type: object
      properties:
        shifts:
          type: array
          items:
            $ref: '#/components/schemas/Shift'
    
    Shift:
      type: object
      required:
        - id
        - patrolId
        - startTime
        - endTime
      properties:
        id:
          type: string
        patrolId:
          type: string
        startTime:
          type: string
          format: date-time
        endTime:
          type: string
          format: date-time
        notes:
          type: string
```

2. **Regenerate the Code**:

```bash
npm run generate:api
```

3. **Implement the New Endpoint**:

```typescript
// src/controllers/patrol-controller.ts
import { ShiftSchedule } from '../generated';

// ... existing code

// GET /patrols/shifts
router.get('/shifts', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const shifts = PatrolService.getShiftSchedule();
    res.json(shifts);
  } catch (error) {
    next(error);
  }
});
```

4. **Implement the Service Method**:

```typescript
// src/services/patrol-service.ts
import { ShiftSchedule } from '../generated';

export const PatrolService = {
  // ... existing methods
  
  getShiftSchedule(): ShiftSchedule {
    // Implement the business logic
    const shifts = ShiftRepository.getAllShifts();
    return { shifts };
  }
};
```

With this workflow, you maintain consistency between your API specification and implementation while taking advantage of the generated types and validation.

## Advanced Usage: Custom Transformations

One of the powerful features of `@hey-api/openapi-ts` is its ability to apply custom transformations to your generated code. This is useful for handling special cases or integrating with specific libraries.

For example, you can configure it to:

- Transform date strings to Date objects automatically
- Add utility methods to all generated models
- Generate custom validation logic
- Integrate with specific frameworks like NestJS or Express

Here's an example of a custom plugin configuration:

```typescript
// openapi-ts.config.ts
import { defineConfig, defaultPlugins } from '@hey-api/openapi-ts';

export default defineConfig({
  input: 'api/openapi.yaml',
  output: 'src/generated',
  plugins: [
    ...defaultPlugins,
    {
      name: '@hey-api/transformers',
      dates: true,
      customTransformers: {
        // Custom transformer for GeoLocation objects
        GeoLocation: {
          import: { module: '../utils/geo', name: 'calculateDistance' },
          code: (typeName, propertyNames) => `
            distanceTo(other: ${typeName}): number {
              return calculateDistance(
                this.${propertyNames.latitude}, 
                this.${propertyNames.longitude},
                other.${propertyNames.latitude},
                other.${propertyNames.longitude}
              );
            }
          `
        }
      }
    }
  ]
});
```

This would add a `distanceTo` method to all `GeoLocation` objects, making it easy to calculate distances between locations.

## Conclusion

OpenAPI code generation is a powerful technique that embodies the API-first approach. By generating code from your API specification, you ensure consistency, improve productivity, and maintain a high level of quality in your service implementation.

In our city services ecosystem, this approach is especially valuable as it ensures that services can reliably communicate with each other based on well-defined contracts. The `@hey-api/openapi-ts` library we've chosen provides an excellent balance of features, type safety, and developer experience, though other libraries are available depending on your specific needs.

By leveraging this approach across all city services, you create a cohesive ecosystem where:

- All services speak the same language
- Type definitions are consistent across services
- API contracts are enforced at both compile time and runtime
- Developers can focus on implementing business logic rather than boilerplate
- Changes to APIs are explicit and tracked in the OpenAPI specification

Now that you've learned about OpenAPI code generation, you can apply this technique to all your city services, creating a robust and maintainable ecosystem of services that work together seamlessly.

Ready to move on? Proceed to the next exercise, where we'll explore how to connect multiple city services together using the API-first approach: [Service Implementation - Introductoin](../02-1-introduction.md) 