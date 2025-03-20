---
layout: layout.njk
---

# Setting Up Your City Service

Now that you understand what we're building, let's get our hands dirty! 🧰

## 1. Exploring the Sample Service

We've prepared a sample service that demonstrates our recommended patterns and structure. This is your reference point throughout the exercise, so let's take a few minutes to explore it.

### File Structure

Navigate to the sample service directory:

```bash
cd services/sample
```

Take a look around. You'll notice the directory structure matches what we outlined in the introduction:

```
services/sample/
├── api/                      # API specification
│   └── openapi.yaml          # OpenAPI definition
├── src/                      # Source code
│   ├── models/               # Data models (TypeScript interfaces)
│   │   └── sample.ts         # Sample resource model
│   ├── repositories/         # Data access layer
│   │   └── sample-repository.ts  # In-memory storage and CRUD operations
│   ├── services/             # Business logic
│   │   └── sample-service.ts # Service methods implementing business rules
│   ├── controllers/          # API handlers
│   │   └── sample-controller.ts  # Express route handlers
│   ├── middleware/           # Express middleware
│   │   ├── error-handler.ts  # Global error handling
│   │   └── openapi.ts        # OpenAPI validation middleware
│   └── index.ts              # Main application entry point
├── package.json              # Dependencies and scripts
└── tsconfig.json             # TypeScript configuration
```

### Key Files to Review

Let's look at some of the key files to understand how they work together:

1. **api/openapi.yaml**: This defines the API contract, with endpoints, request/response schemas, and examples.

2. **src/models/sample.ts**: TypeScript interfaces matching the schemas in the API spec.

3. **src/repositories/sample-repository.ts**: Simple in-memory storage with methods to create, read, update, and delete resources.

4. **src/services/sample-service.ts**: Business logic that uses the repository layer and implements service-specific rules.

5. **src/controllers/sample-controller.ts**: Express route handlers that validate requests, call service methods, and format responses.

6. **src/middleware/openapi.ts**: Configures the OpenAPI validator middleware that ensures all requests and responses conform to the API spec.

7. **src/index.ts**: Puts everything together - sets up Express, registers middleware and routes, and starts the server.

Take a few minutes to look at these files to understand how they work together in the API-first approach.

## 2. Setting Up Your Service

Now that you've explored the sample, let's set up your own service structure. We'll create the directory structure and copy over some boilerplate files to save time.

### Create Your Project Directory

First, create a directory for your service. Replace `your-service-name` with the actual name of your service (e.g., `police`, `fire`, `power-plant`):

```bash
mkdir -p services/your-service-name
```

### Set Up the Project Structure

Create the basic directory structure for your source code:

```bash
mkdir -p services/your-service-name/src/{models,repositories,services,controllers,middleware}
mkdir -p services/your-service-name/api
```

### Copy Configuration Files

Copy the basic configuration files from the sample project:

```bash
# Copy package.json and modify it for your service
cp services/sample/package.json services/your-service-name/
sed -i '' "s/sample-service/your-service-name/g" services/your-service-name/package.json

# Copy TypeScript configuration
cp services/sample/tsconfig.json services/your-service-name/

# Copy any build or utility scripts
cp -r services/sample/scripts services/your-service-name/ 2>/dev/null || mkdir -p services/your-service-name/scripts
```

### Copy Your API Specification

If you completed Exercise 1, you should already have an OpenAPI specification for your service. Copy it to the api directory:

```bash
# If you already have an OpenAPI spec from Exercise 1
cp your-openapi-spec.yaml services/your-service-name/api/openapi.yaml

# Or if you need to create a new one, you can copy the sample and modify it
cp services/sample/api/openapi.yaml services/your-service-name/api/
```

### Copy Middleware Files

The middleware code is mostly reusable, so let's copy it from the sample:

```bash
cp services/sample/src/middleware/* services/your-service-name/src/middleware/
```

### Create a Basic Index.ts File

Create a minimal `index.ts` file to start with:

```bash
cat > services/your-service-name/src/index.ts << EOF
import express from 'express';
import cors from 'cors';
import { json } from 'body-parser';
import { OpenAPIValidator } from 'express-openapi-validator';
import { join } from 'path';
import errorHandler from './middleware/error-handler';

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(json());

// Serve OpenAPI spec
app.use('/api-docs', express.static(join(__dirname, '../api')));

// OpenAPI validation middleware
app.use(
  OpenAPIValidator.middleware({
    apiSpec: join(__dirname, '../api/openapi.yaml'),
    validateRequests: true,
    validateResponses: true
  })
);

// Routes will be added here

// Error handling middleware
app.use(errorHandler);

// Start server
app.listen(port, () => {
  console.log(\`🚀 \${process.env.SERVICE_NAME || 'Your service'} running at http://localhost:\${port}\`);
  console.log(\`📚 API documentation at http://localhost:\${port}/api-docs\`);
});
EOF
```

### Install Dependencies

Now, let's install the dependencies needed for your service:

```bash
cd services/your-service-name
npm install
```

This will install all the dependencies specified in the package.json file, including Express, TypeScript, OpenAPI validator, and other utilities.

## 3. Understanding Your Service's Resources

Before we start implementing the code, take a moment to think about your service's main resources based on your API specification. For example:

- **Police Service**: Patrols, Officers, Emergency Calls
- **Fire Service**: Fire Trucks, Firefighters, Emergency Calls
- **Power Plant**: Energy Production, Distribution Points, Usage Metrics
- **Traffic Cameras**: Cameras, Violations, Traffic Observations

Identify your main resources and the operations you'll need to implement for each. This will guide your implementation in the following sections.

## 4. Next Steps

Now that your project structure is set up, you're ready to start implementing your service's specific functionality. In the next section, we'll implement the data models that match your API schemas.

Ready to continue? Head over to [Implementing Your Models](../02-3-models) 