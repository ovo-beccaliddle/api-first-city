# API First Workshop: City Services Walking Skeleton

## Overview

This document outlines the implementation plan for a walking skeleton of the "API First" workshop using a City Services metaphor. A walking skeleton is a minimal implementation that demonstrates the core architecture and infrastructure without implementing all the business logic.

The implementation follows an API-first approach where the API contract is defined before implementation, allowing teams to work independently while ensuring interoperability.

## Project Structure

The project will follow the structure outlined in the design document:

```
city-services/
├── infrastructure/
│   ├── api-gateway/          # Gravitee configuration and setup
│   ├── service-registry/     # Service discovery
│   └── iam/                  # OAuth IAM service
├── common/
│   ├── models/               # Shared data models
│   ├── errors/               # Standardized error types
│   ├── logging/              # Centralized logging
│   └── testing/              # Test utilities and mocks
├── services/
│   ├── sample/               # Template service
│   ├── emergency-services/
│   │   ├── police/
│   │   ├── fire/
│   │   └── ambulance/
│   ├── utilities/
│   │   ├── water/
│   │   ├── electric/
│   │   └── waste/
│   ├── transportation/
│   │   ├── traffic/
│   │   └── public-transit/
│   └── citizen-services/
│       ├── requests/
│       └── permits/
└── docs/
    ├── DESIGN.md             # High-level design document
    └── WALKING-SKELETON.md   # This document
```

## Technology Stack

Based on the design document and additional requirements, the technology stack includes:

- **Node.js (v20+) with TypeScript** - For all services
- **Express.js** - Web framework for API implementation
- **OpenAPI 3.0** - For API contract definition
- **Jest** - Testing framework
- **Docker & k3d** - Containerization and local Kubernetes
- **Gravitee** - API Gateway for routing and management
- **OAuth 2.0** - Authentication via centralized IAM service
- **Google Pub-Sub** - For event-based communication between services
- **Firebase** - Document database for services
- **Cloudflare Workers Compatible KV** - For caching and session management
- **Swagger UI** - For API documentation and exploration
- **Prism** - For API mocking
- **ESLint & Prettier** - Code quality and formatting

## Core Infrastructure Components

### 1. API Gateway (Gravitee)

The API Gateway serves as the entry point for all service requests, providing routing, authentication, rate limiting, and monitoring.

```yaml
# infrastructure/api-gateway/config.yaml
# Pseudo-code for Gravitee API Gateway configuration

apis:
  # Sample service API definition
  - name: sample-service
    context-path: /sample
    target: http://sample-service:3000
    policies:
      - name: rate-limiting
        configuration:
          rate: 100
          timeUnit: MINUTE
      - name: oauth2
        configuration:
          authorizationServer: http://iam-service:3000
          clientId: sample-service
          scopes:
            - read:sample
            - write:sample

  # Emergency Services APIs
  - name: police-service
    context-path: /emergency/police
    target: http://police-service:3000
    policies:
      - name: oauth2
      # Additional policies...

  # Other service routes will follow similar pattern
```

### 2. IAM Service

A simple OAuth 2.0 service that provides authentication and authorization for all city services.

```typescript
// infrastructure/iam/src/server.ts
// Pseudo-code for IAM Service

import express from "express";
import { generateToken, verifyToken } from "./auth";

const app = express();
app.use(express.json());

// Define available scopes for all city services
const AVAILABLE_SCOPES = {
  "police-service": ["read:incidents", "write:incidents"],
  "fire-service": ["read:emergencies", "write:emergencies"],
  // Other services...
};

// OAuth token endpoint
app.post("/oauth/token", (req, res) => {
  const { client_id, client_secret, grant_type, scope } = req.body;

  // Validate client credentials
  // In a real implementation, these would be stored securely
  if (!validateClient(client_id, client_secret)) {
    return res.status(401).json({ error: "invalid_client" });
  }

  // For simplicity in the workshop, always issue a token
  const token = generateToken({
    client_id,
    scope: scope
      .split(" ")
      .filter((s) => AVAILABLE_SCOPES[client_id]?.includes(s)),
  });

  return res.json({
    access_token: token,
    token_type: "bearer",
    expires_in: 3600,
    scope: scope,
  });
});

// Token introspection endpoint for gateway validation
app.post("/oauth/introspect", (req, res) => {
  const token = req.body.token;

  try {
    const decoded = verifyToken(token);
    return res.json({
      active: true,
      scope: decoded.scope,
      client_id: decoded.client_id,
      exp: decoded.exp,
    });
  } catch (err) {
    return res.json({ active: false });
  }
});

app.listen(3000, () => {
  console.log("IAM Service running on port 3000");
});
```

### 3. Service Registry

A service discovery mechanism allowing services to find and communicate with each other.

```typescript
// infrastructure/service-registry/src/server.ts
// Pseudo-code for Service Registry

import express from "express";
import { KVStore } from "./kv-store";

const app = express();
app.use(express.json());

// In-memory store for service registration
// In production, use a distributed KV store
const serviceRegistry = new KVStore();

// Register a service
app.post("/register", (req, res) => {
  const { name, url, health_check_url, metadata } = req.body;

  serviceRegistry.set(name, {
    url,
    health_check_url,
    metadata,
    last_heartbeat: Date.now(),
  });

  return res.status(201).json({ status: "registered" });
});

// Service heartbeat
app.post("/heartbeat/:name", (req, res) => {
  const name = req.params.name;
  const service = serviceRegistry.get(name);

  if (!service) {
    return res.status(404).json({ error: "service_not_found" });
  }

  service.last_heartbeat = Date.now();
  serviceRegistry.set(name, service);

  return res.json({ status: "ok" });
});

// Discover services
app.get("/services", (req, res) => {
  const services = {};
  for (const [name, details] of serviceRegistry.entries()) {
    services[name] = details;
  }

  return res.json(services);
});

// Get specific service
app.get("/services/:name", (req, res) => {
  const name = req.params.name;
  const service = serviceRegistry.get(name);

  if (!service) {
    return res.status(404).json({ error: "service_not_found" });
  }

  return res.json(service);
});

app.listen(3000, () => {
  console.log("Service Registry running on port 3000");
});
```

### 4. Event Bus Configuration

Setup for Google Pub-Sub topics and subscriptions to enable event-based communication between services.

```typescript
// infrastructure/event-bus/setup.ts
// Pseudo-code for setting up Google Pub-Sub topics

import { PubSub } from "@google-cloud/pubsub";

const pubsub = new PubSub();

// Create topics for various event categories
async function setupEventBus() {
  // Emergency service events
  await pubsub.createTopic("emergency.incidents.reported");
  await pubsub.createTopic("emergency.incidents.updated");
  await pubsub.createTopic("emergency.incidents.resolved");

  // Utility service events
  await pubsub.createTopic("utilities.outages.reported");
  await pubsub.createTopic("utilities.maintenance.scheduled");

  // Transportation events
  await pubsub.createTopic("transportation.traffic.congestion");
  await pubsub.createTopic("transportation.public-transit.delays");

  // Citizen service events
  await pubsub.createTopic("citizen.requests.submitted");
  await pubsub.createTopic("citizen.permits.approved");

  console.log("Event bus topics created successfully");
}

setupEventBus().catch(console.error);
```

## Common Components

### 1. Shared Models

Common data models used across city services.

```typescript
// common/models/common.ts
// Pseudo-code for common data models

export interface Location {
  address: string;
  neighborhood: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
}

export interface TimeRange {
  start: Date;
  end?: Date;
}

export interface Contact {
  name: string;
  phone?: string;
  email?: string;
}

export enum Priority {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  CRITICAL = "critical",
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  next_cursor?: string;
}
```

### 2. Standardized Errors

Unified error handling across all services.

```typescript
// common/errors/index.ts
// Pseudo-code for standardized error handling

export class ApiError extends Error {
  statusCode: number;
  errorCode: string;
  details?: any;

  constructor(
    statusCode: number,
    errorCode: string,
    message: string,
    details?: any,
  ) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.details = details;
  }

  toJSON() {
    return {
      error: {
        code: this.errorCode,
        message: this.message,
        details: this.details,
      },
    };
  }
}

export class NotFoundError extends ApiError {
  constructor(resource: string, id: string) {
    super(404, "resource_not_found", `${resource} with id ${id} not found`);
  }
}

export class ValidationError extends ApiError {
  constructor(details: any) {
    super(400, "validation_error", "Validation failed", details);
  }
}

export class AuthorizationError extends ApiError {
  constructor(message = "Insufficient permissions") {
    super(403, "forbidden", message);
  }
}

// Express middleware for handling errors
export function errorHandler(err, req, res, next) {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json(err.toJSON());
  }

  // Log unexpected errors
  console.error(err);

  // Return generic error
  return res.status(500).json({
    error: {
      code: "internal_server_error",
      message: "An unexpected error occurred",
    },
  });
}
```

### 3. Logging

Centralized logging infrastructure.

```typescript
// common/logging/index.ts
// Pseudo-code for centralized logging

export enum LogLevel {
  DEBUG = "debug",
  INFO = "info",
  WARN = "warn",
  ERROR = "error",
}

export interface LogContext {
  service: string;
  requestId?: string;
  userId?: string;
  [key: string]: any;
}

export class Logger {
  private context: LogContext;

  constructor(context: LogContext) {
    this.context = context;
  }

  private log(level: LogLevel, message: string, data?: any) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      message,
      ...this.context,
      ...(data ? { data } : {}),
    };

    // In production, send to centralized logging
    console.log(JSON.stringify(logEntry));
  }

  debug(message: string, data?: any) {
    this.log(LogLevel.DEBUG, message, data);
  }

  info(message: string, data?: any) {
    this.log(LogLevel.INFO, message, data);
  }

  warn(message: string, data?: any) {
    this.log(LogLevel.WARN, message, data);
  }

  error(message: string, error?: Error, data?: any) {
    this.log(LogLevel.ERROR, message, {
      ...(data || {}),
      stack: error?.stack,
      message: error?.message,
    });
  }

  // Create a new logger with additional context
  withContext(additionalContext: Partial<LogContext>) {
    return new Logger({
      ...this.context,
      ...additionalContext,
    });
  }
}

// Express middleware for request logging
export function requestLogger(serviceName: string) {
  return (req, res, next) => {
    const requestId = req.headers["x-request-id"] || generateRequestId();
    const startTime = Date.now();

    // Add request ID header for tracing
    res.setHeader("x-request-id", requestId);

    // Create logger for this request
    const logger = new Logger({
      service: serviceName,
      requestId,
      method: req.method,
      path: req.path,
    });

    // Attach logger to request object
    req.logger = logger;

    // Log request completion
    res.on("finish", () => {
      const duration = Date.now() - startTime;
      logger.info("Request completed", {
        statusCode: res.statusCode,
        duration,
        userAgent: req.headers["user-agent"],
      });
    });

    next();
  };
}
```

## Service Template

Each service in the city ecosystem follows a common structure, making it easy for workshop participants to understand and extend.

```
service-name/
├── api/
│   └── openapi.yaml       # API contract definition
├── src/
│   ├── index.ts           # Service entry point
│   ├── config.ts          # Configuration loading
│   ├── controllers/       # Route handlers
│   ├── services/          # Business logic
│   ├── models/            # Domain models
│   ├── repositories/      # Data access
│   ├── events/            # Event publishers/subscribers
│   └── middleware/        # Custom middleware
├── tests/
│   ├── unit/              # Unit tests
│   ├── integration/       # Integration tests
│   └── contract/          # Contract tests
├── Dockerfile             # Container definition
└── package.json           # Dependencies and scripts
```

### Sample Service Implementation

```typescript
// services/sample/src/index.ts
// Pseudo-code for sample service entry point

import express from "express";
import { errorHandler } from "common/errors";
import { requestLogger } from "common/logging";
import controllers from "./controllers";
import middleware from "./middleware";
import { initEventSubscriptions } from "./events";
import config from "./config";

// Initialize Express app
const app = express();

// Middleware setup
app.use(express.json());
app.use(requestLogger("sample-service"));
app.use(middleware.validateApiKey);

// Register routes
app.use("/api/v1/resources", controllers.resources);
app.use("/api/v1/health", (req, res) => res.json({ status: "ok" }));

// Error handling
app.use(errorHandler);

// Start server
const server = app.listen(config.port, () => {
  console.log(`Sample service running on port ${config.port}`);

  // Register with service registry
  registerService();

  // Setup event subscriptions
  initEventSubscriptions();
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM received, shutting down");
  server.close(() => {
    console.log("Server closed");
    process.exit(0);
  });
});

// Service registry registration
function registerService() {
  fetch(`${config.serviceRegistry.url}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "sample-service",
      url: `http://sample-service:${config.port}`,
      health_check_url: `http://sample-service:${config.port}/api/v1/health`,
      metadata: {
        version: process.env.VERSION || "1.0.0",
      },
    }),
  })
    .then(() => {
      console.log("Registered with service registry");

      // Setup heartbeat interval
      setInterval(() => {
        fetch(`${config.serviceRegistry.url}/heartbeat/sample-service`, {
          method: "POST",
        }).catch((err) => {
          console.error("Failed to send heartbeat", err);
        });
      }, 30000);
    })
    .catch((err) => {
      console.error("Failed to register with service registry", err);
    });
}
```

### API Contract First Approach

```yaml
# services/sample/api/openapi.yaml
# Pseudo-code for OpenAPI specification

openapi: 3.0.0
info:
  title: Sample Service API
  version: 1.0.0
  description: Template service demonstrating API-first design
paths:
  /resources:
    get:
      summary: List resources
      parameters:
        - name: page
          in: query
          schema:
            type: integer
            default: 1
        - name: page_size
          in: query
          schema:
            type: integer
            default: 20
      responses:
        200:
          description: List of resources
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/ResourceList"
    post:
      summary: Create a new resource
      requestBody:
        content:
          application/json:
            schema:
              $ref: "#/components/schemas/ResourceCreate"
      responses:
        201:
          description: Resource created
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/Resource"
  /resources/{id}:
    get:
      summary: Get a resource by ID
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: string
      responses:
        200:
          description: Resource details
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/Resource"
        404:
          description: Resource not found
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/Error"
components:
  schemas:
    Resource:
      type: object
      properties:
        id:
          type: string
        name:
          type: string
        description:
          type: string
        createdAt:
          type: string
          format: date-time
        updatedAt:
          type: string
          format: date-time
      required:
        - id
        - name
    ResourceCreate:
      type: object
      properties:
        name:
          type: string
        description:
          type: string
      required:
        - name
    ResourceList:
      type: object
      properties:
        items:
          type: array
          items:
            $ref: "#/components/schemas/Resource"
        total:
          type: integer
        page:
          type: integer
        page_size:
          type: integer
    Error:
      type: object
      properties:
        error:
          type: object
          properties:
            code:
              type: string
            message:
              type: string
            details:
              type: object
```

## City Service Categories

The workshop includes several categories of city services, each with its own domain focus but following consistent API-first principles. Below are the key service categories and their implementation details.

### 1. Emergency Services

Emergency services handle critical incidents and emergency responses throughout the city.

#### Police Department Service

```yaml
# services/emergency-services/police/api/openapi.yaml
# Pseudo-code for Police Department API

openapi: 3.0.0
info:
  title: Police Department API
  version: 1.0.0
  description: API for city police department services
paths:
  /incidents:
    get:
      summary: List incidents
      parameters:
        - name: status
          in: query
          schema:
            type: string
            enum: [reported, in-progress, resolved]
        - name: neighborhood
          in: query
          schema:
            type: string
      responses:
        200:
          description: List of incidents
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/IncidentList"
    post:
      summary: Report a new incident
      requestBody:
        content:
          application/json:
            schema:
              $ref: "#/components/schemas/IncidentReport"
      responses:
        201:
          description: Incident created
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/Incident"
  /incidents/{id}:
    get:
      summary: Get incident details
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: string
      responses:
        200:
          description: Incident details
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/Incident"
    patch:
      summary: Update incident status
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: string
      requestBody:
        content:
          application/json:
            schema:
              $ref: "#/components/schemas/IncidentUpdate"
      responses:
        200:
          description: Incident updated
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/Incident"
components:
  schemas:
    Incident:
      type: object
      properties:
        id:
          type: string
          format: uuid
        type:
          type: string
          enum: [theft, vandalism, noise, traffic, other]
        location:
          $ref: "#/components/schemas/Location"
        status:
          type: string
          enum: [reported, in-progress, resolved]
        reportedAt:
          type: string
          format: date-time
        resolvedAt:
          type: string
          format: date-time
        description:
          type: string
        priority:
          $ref: "#/components/schemas/Priority"
      required:
        - id
        - type
        - location
        - status
        - reportedAt
    # Other schema definitions...
```

#### Fire Department Service

```yaml
# services/emergency-services/fire/api/openapi.yaml
# Pseudo-code for Fire Department API

openapi: 3.0.0
info:
  title: Fire Department API
  version: 1.0.0
  description: API for city fire department services
paths:
  /emergencies:
    get:
      summary: List fire emergencies
      parameters:
        - name: status
          in: query
          schema:
            type: string
            enum: [reported, responding, contained, resolved]
      responses:
        200:
          description: List of fire emergencies
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/EmergencyList"
    post:
      summary: Report a new fire emergency
      requestBody:
        content:
          application/json:
            schema:
              $ref: "#/components/schemas/EmergencyReport"
      responses:
        201:
          description: Emergency created
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/Emergency"
  # Other endpoints...
components:
  schemas:
    Emergency:
      type: object
      properties:
        id:
          type: string
        type:
          type: string
          enum: [structure, vehicle, wildfire, hazmat, other]
        location:
          $ref: "#/components/schemas/Location"
        status:
          type: string
          enum: [reported, responding, contained, resolved]
        severity:
          type: string
          enum: [low, medium, high, critical]
        reportedAt:
          type: string
          format: date-time
      required:
        - id
        - type
        - location
        - status
        - severity
        - reportedAt
    # Other schema definitions...
```

### 2. Utilities Services

Utilities services manage essential city infrastructure like water, electricity, and waste management.

#### Water Service

```yaml
# services/utilities/water/api/openapi.yaml
# Pseudo-code for Water Utility API

openapi: 3.0.0
info:
  title: Water Utility API
  version: 1.0.0
  description: API for city water utility services
paths:
  /outages:
    get:
      summary: List water outages
      parameters:
        - name: status
          in: query
          schema:
            type: string
            enum: [planned, in-progress, resolved]
        - name: neighborhood
          in: query
          schema:
            type: string
      responses:
        200:
          description: List of water outages
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/OutageList"
    post:
      summary: Report a new water outage
      requestBody:
        content:
          application/json:
            schema:
              $ref: "#/components/schemas/OutageReport"
      responses:
        201:
          description: Outage created
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/Outage"
  /usage:
    get:
      summary: Get water usage statistics
      parameters:
        - name: neighborhood
          in: query
          schema:
            type: string
        - name: timeframe
          in: query
          schema:
            type: string
            enum: [daily, weekly, monthly]
            default: daily
      responses:
        200:
          description: Water usage statistics
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/UsageStats"
  # Other endpoints...
components:
  schemas:
    Outage:
      type: object
      properties:
        id:
          type: string
        status:
          type: string
          enum: [planned, in-progress, resolved]
        affectedArea:
          $ref: "#/components/schemas/Area"
        startTime:
          type: string
          format: date-time
        estimatedResolutionTime:
          type: string
          format: date-time
        actualResolutionTime:
          type: string
          format: date-time
        reason:
          type: string
      required:
        - id
        - status
        - affectedArea
        - startTime
    # Other schema definitions...
```

#### Electric Service

```yaml
# services/utilities/electric/api/openapi.yaml
# Pseudo-code for Electric Utility API

openapi: 3.0.0
info:
  title: Electric Utility API
  version: 1.0.0
  description: API for city electric utility services
paths:
  /outages:
    get:
      summary: List power outages
      parameters:
        - name: status
          in: query
          schema:
            type: string
            enum: [planned, in-progress, resolved]
        - name: neighborhood
          in: query
          schema:
            type: string
      responses:
        200:
          description: List of power outages
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/OutageList"
    post:
      summary: Report a new power outage
      requestBody:
        content:
          application/json:
            schema:
              $ref: "#/components/schemas/OutageReport"
      responses:
        201:
          description: Outage created
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/Outage"
  /consumption:
    get:
      summary: Get power consumption data
      parameters:
        - name: neighborhood
          in: query
          schema:
            type: string
        - name: timeframe
          in: query
          schema:
            type: string
            enum: [hourly, daily, weekly, monthly]
            default: daily
      responses:
        200:
          description: Power consumption statistics
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/ConsumptionStats"
  /grid-status:
    get:
      summary: Get current power grid status
      responses:
        200:
          description: Current status of the power grid
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/GridStatus"
components:
  schemas:
    Outage:
      type: object
      properties:
        id:
          type: string
        status:
          type: string
          enum: [planned, in-progress, resolved]
        affectedArea:
          $ref: "#/components/schemas/Area"
        startTime:
          type: string
          format: date-time
        estimatedResolutionTime:
          type: string
          format: date-time
        actualResolutionTime:
          type: string
          format: date-time
        reason:
          type: string
        affectedCustomers:
          type: integer
      required:
        - id
        - status
        - affectedArea
        - startTime
        - affectedCustomers
    GridStatus:
      type: object
      properties:
        overallStatus:
          type: string
          enum: [normal, alert, critical]
        loadPercentage:
          type: number
          format: float
          minimum: 0
          maximum: 100
        activeOutages:
          type: integer
        lastUpdated:
          type: string
          format: date-time
      required:
        - overallStatus
        - loadPercentage
        - activeOutages
        - lastUpdated
    # Other schema definitions...
```

#### Waste Service

```yaml
# services/utilities/waste/api/openapi.yaml
# Pseudo-code for Waste Utility API

openapi: 3.0.0
info:
  title: Waste Utility API
  version: 1.0.0
  description: API for city waste utility services
paths:
  /outages:
    get:
      summary: List waste outages
      parameters:
        - name: status
          in: query
          schema:
            type: string
            enum: [planned, in-progress, resolved]
        - name: neighborhood
          in: query
          schema:
            type: string
      responses:
        200:
          description: List of waste outages
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/OutageList"
    post:
      summary: Report a new waste outage
      requestBody:
        content:
          application/json:
            schema:
              $ref: "#/components/schemas/OutageReport"
      responses:
        201:
          description: Outage created
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/Outage"
  /usage:
    get:
      summary: Get waste usage statistics
      parameters:
        - name: neighborhood
          in: query
          schema:
            type: string
        - name: timeframe
          in: query
          schema:
            type: string
            enum: [daily, weekly, monthly]
            default: daily
      responses:
        200:
          description: Waste usage statistics
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/UsageStats"
  # Other endpoints...
components:
  schemas:
    Outage:
      type: object
      properties:
        id:
          type: string
        status:
          type: string
          enum: [planned, in-progress, resolved]
        affectedArea:
          $ref: "#/components/schemas/Area"
        startTime:
          type: string
          format: date-time
        estimatedResolutionTime:
          type: string
          format: date-time
        actualResolutionTime:
          type: string
          format: date-time
        reason:
          type: string
      required:
        - id
        - status
        - affectedArea
        - startTime
    # Other schema definitions...
```

### 3. Transportation Services

Transportation services manage traffic flow and public transit operations throughout the city.

#### Traffic Service

```yaml
# services/transportation/traffic/api/openapi.yaml
# Pseudo-code for Traffic Service API

openapi: 3.0.0
info:
  title: Traffic Service API
  version: 1.0.0
  description: API for city traffic management
paths:
  /congestion:
    get:
      summary: Get traffic congestion information
      parameters:
        - name: neighborhood
          in: query
          schema:
            type: string
      responses:
        200:
          description: Current traffic congestion data
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/CongestionMap"
  /incidents:
    get:
      summary: List traffic incidents
      parameters:
        - name: status
          in: query
          schema:
            type: string
            enum: [active, cleared]
        - name: severity
          in: query
          schema:
            type: string
            enum: [low, medium, high]
      responses:
        200:
          description: List of traffic incidents
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/IncidentList"
    post:
      summary: Report a traffic incident
      requestBody:
        content:
          application/json:
            schema:
              $ref: "#/components/schemas/IncidentReport"
      responses:
        201:
          description: Incident reported
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/Incident"
  /road-closures:
    get:
      summary: Get road closure information
      parameters:
        - name: startDate
          in: query
          schema:
            type: string
            format: date
        - name: endDate
          in: query
          schema:
            type: string
            format: date
      responses:
        200:
          description: List of road closures
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/RoadClosureList"
components:
  schemas:
    CongestionMap:
      type: object
      properties:
        timestamp:
          type: string
          format: date-time
        areas:
          type: array
          items:
            $ref: "#/components/schemas/TrafficArea"
      required:
        - timestamp
        - areas
    TrafficArea:
      type: object
      properties:
        name:
          type: string
        congestionLevel:
          type: string
          enum: [light, moderate, heavy, severe]
        averageSpeed:
          type: number
          format: float
        coordinates:
          type: array
          items:
            $ref: "#/components/schemas/Coordinates"
      required:
        - name
        - congestionLevel
        - averageSpeed
    Incident:
      type: object
      properties:
        id:
          type: string
        type:
          type: string
          enum: [accident, construction, event, hazard, other]
        location:
          $ref: "#/components/schemas/Location"
        status:
          type: string
          enum: [active, cleared]
        severity:
          type: string
          enum: [low, medium, high]
        reportedAt:
          type: string
          format: date-time
        clearedAt:
          type: string
          format: date-time
      required:
        - id
        - type
        - location
        - status
        - severity
        - reportedAt
    # Other schema definitions...
```

#### Public Transit Service

```yaml
# services/transportation/public-transit/api/openapi.yaml
# Pseudo-code for Public Transit Service API

openapi: 3.0.0
info:
  title: Public Transit Service API
  version: 1.0.0
  description: API for city public transit operations
paths:
  /routes:
    get:
      summary: List transit routes
      parameters:
        - name: type
          in: query
          schema:
            type: string
            enum: [bus, subway, tram, ferry]
      responses:
        200:
          description: List of transit routes
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/RouteList"
  /routes/{routeId}:
    get:
      summary: Get route details
      parameters:
        - name: routeId
          in: path
          required: true
          schema:
            type: string
      responses:
        200:
          description: Route details
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/Route"
  /vehicles:
    get:
      summary: Get vehicle locations
      parameters:
        - name: routeId
          in: query
          schema:
            type: string
      responses:
        200:
          description: Current vehicle locations
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/VehicleLocationList"
  /schedule:
    get:
      summary: Get transit schedule
      parameters:
        - name: routeId
          in: query
          schema:
            type: string
        - name: stopId
          in: query
          schema:
            type: string
        - name: date
          in: query
          schema:
            type: string
            format: date
      responses:
        200:
          description: Transit schedule
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/ScheduleList"
  /delays:
    get:
      summary: Get current transit delays
      responses:
        200:
          description: Current transit delays
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/DelayList"
components:
  schemas:
    Route:
      type: object
      properties:
        id:
          type: string
        name:
          type: string
        type:
          type: string
          enum: [bus, subway, tram, ferry]
        stops:
          type: array
          items:
            $ref: "#/components/schemas/Stop"
        status:
          type: string
          enum: [active, suspended, modified]
      required:
        - id
        - name
        - type
        - stops
        - status
    Stop:
      type: object
      properties:
        id:
          type: string
        name:
          type: string
        location:
          $ref: "#/components/schemas/Location"
        accessibility:
          type: boolean
      required:
        - id
        - name
        - location
    Vehicle:
      type: object
      properties:
        id:
          type: string
        routeId:
          type: string
        location:
          $ref: "#/components/schemas/Location"
        heading:
          type: number
        speed:
          type: number
        capacity:
          type: integer
        occupancy:
          type: string
          enum: [empty, low, medium, high, full]
        updatedAt:
          type: string
          format: date-time
      required:
        - id
        - routeId
        - location
        - updatedAt
    # Other schema definitions...
```

### 4. Citizen Services

Citizen Services facilitate direct interaction between residents and city government, handling service requests and permit applications.

#### Service Requests

```yaml
# services/citizen-services/requests/api/openapi.yaml
# Pseudo-code for Citizen Service Requests API

openapi: 3.0.0
info:
  title: Service Requests API
  version: 1.0.0
  description: API for city service requests management
paths:
  /requests:
    get:
      summary: List service requests
      parameters:
        - name: status
          in: query
          schema:
            type: string
            enum: [submitted, in-progress, completed, canceled]
        - name: category
          in: query
          schema:
            type: string
        - name: neighborhood
          in: query
          schema:
            type: string
      responses:
        200:
          description: List of service requests
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/RequestList"
    post:
      summary: Submit a new service request
      requestBody:
        content:
          application/json:
            schema:
              $ref: "#/components/schemas/RequestSubmission"
      responses:
        201:
          description: Service request submitted
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/Request"
  /requests/{id}:
    get:
      summary: Get service request details
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: string
      responses:
        200:
          description: Service request details
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/Request"
    patch:
      summary: Update service request status
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: string
      requestBody:
        content:
          application/json:
            schema:
              $ref: "#/components/schemas/RequestUpdate"
      responses:
        200:
          description: Service request updated
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/Request"
  /categories:
    get:
      summary: List service request categories
      responses:
        200:
          description: List of service categories
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/CategoryList"
components:
  schemas:
    Request:
      type: object
      properties:
        id:
          type: string
        category:
          type: string
        subcategory:
          type: string
        status:
          type: string
          enum: [submitted, in-progress, completed, canceled]
        priority:
          $ref: "#/components/schemas/Priority"
        location:
          $ref: "#/components/schemas/Location"
        description:
          type: string
        submittedBy:
          $ref: "#/components/schemas/Contact"
        submittedAt:
          type: string
          format: date-time
        updatedAt:
          type: string
          format: date-time
        completedAt:
          type: string
          format: date-time
        assignedDepartment:
          type: string
        photos:
          type: array
          items:
            type: string
            format: uri
      required:
        - id
        - category
        - status
        - location
        - description
        - submittedBy
        - submittedAt
    RequestSubmission:
      type: object
      properties:
        category:
          type: string
        subcategory:
          type: string
        location:
          $ref: "#/components/schemas/Location"
        description:
          type: string
        submittedBy:
          $ref: "#/components/schemas/Contact"
        photos:
          type: array
          items:
            type: string
            format: uri
      required:
        - category
        - location
        - description
        - submittedBy
    # Other schema definitions...
```

#### Permits Service

```yaml
# services/citizen-services/permits/api/openapi.yaml
# Pseudo-code for Permits Service API

openapi: 3.0.0
info:
  title: Permits Service API
  version: 1.0.0
  description: API for city permits management
paths:
  /permits:
    get:
      summary: List permits
      parameters:
        - name: status
          in: query
          schema:
            type: string
            enum: [draft, submitted, under-review, approved, rejected, expired]
        - name: type
          in: query
          schema:
            type: string
        - name: applicantId
          in: query
          schema:
            type: string
      responses:
        200:
          description: List of permits
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/PermitList"
    post:
      summary: Create a new permit application
      requestBody:
        content:
          application/json:
            schema:
              $ref: "#/components/schemas/PermitApplication"
      responses:
        201:
          description: Permit application created
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/Permit"
  /permits/{id}:
    get:
      summary: Get permit details
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: string
      responses:
        200:
          description: Permit details
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/Permit"
    patch:
      summary: Update permit status
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: string
      requestBody:
        content:
          application/json:
            schema:
              $ref: "#/components/schemas/PermitUpdate"
      responses:
        200:
          description: Permit updated
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/Permit"
  /permit-types:
    get:
      summary: List available permit types
      responses:
        200:
          description: List of permit types
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/PermitTypeList"
components:
  schemas:
    Permit:
      type: object
      properties:
        id:
          type: string
        type:
          type: string
        status:
          type: string
          enum: [draft, submitted, under-review, approved, rejected, expired]
        applicant:
          $ref: "#/components/schemas/Contact"
        location:
          $ref: "#/components/schemas/Location"
        submittedAt:
          type: string
          format: date-time
        updatedAt:
          type: string
          format: date-time
        expiresAt:
          type: string
          format: date-time
        reviewerId:
          type: string
        reviewComments:
          type: string
        attachments:
          type: array
          items:
            $ref: "#/components/schemas/Attachment"
      required:
        - id
        - type
        - status
        - applicant
        - location
    PermitApplication:
      type: object
      properties:
        type:
          type: string
        applicant:
          $ref: "#/components/schemas/Contact"
        location:
          $ref: "#/components/schemas/Location"
        description:
          type: string
        attachments:
          type: array
          items:
            $ref: "#/components/schemas/Attachment"
      required:
        - type
        - applicant
        - location
    Attachment:
      type: object
      properties:
        id:
          type: string
        name:
          type: string
        type:
          type: string
        url:
          type: string
          format: uri
        uploadedAt:
          type: string
          format: date-time
      required:
        - id
        - name
        - type
        - url
        - uploadedAt
    # Other schema definitions...
```

## Testing Patterns

The walking skeleton includes standardized testing patterns to ensure the quality and reliability of all city services.

### 1. Contract Testing

Contract tests verify that service implementations adhere to their OpenAPI specifications.

```typescript
// services/sample/tests/contract/resources.test.ts
// Pseudo-code for contract testing

import { OpenAPIValidator } from "express-openapi-validator";
import request from "supertest";
import app from "../../src/app";
import * as path from "path";

describe("Resources API Contract Tests", () => {
  beforeAll(async () => {
    // Setup OpenAPI validator with the service's API spec
    const apiSpec = path.join(__dirname, "../../api/openapi.yaml");
    const validator = new OpenAPIValidator({
      apiSpec,
      validateRequests: true,
      validateResponses: true,
    });

    // Add validator middleware to app
    app.use(validator.middleware());
  });

  describe("GET /resources", () => {
    it("should return resources list that matches schema", async () => {
      const response = await request(app)
        .get("/api/v1/resources")
        .expect("Content-Type", /json/)
        .expect(200);

      // The validator middleware will automatically validate
      // the response against the schema
      expect(response.body).toHaveProperty("items");
      expect(response.body).toHaveProperty("total");
    });

    it("should validate query parameters", async () => {
      // Test with invalid parameters to ensure validation
      await request(app).get("/api/v1/resources?page=invalid").expect(400); // Should fail validation
    });
  });

  // Additional endpoint tests...
});
```

### 2. Integration Testing

Integration tests verify that services interact correctly with other components.

```typescript
// services/emergency-services/police/tests/integration/incidents.test.ts
// Pseudo-code for integration testing

import request from "supertest";
import app from "../../src/app";
import { mockEventPublisher } from "../../src/mocks/events";
import { mockServiceRegistry } from "../../src/mocks/serviceRegistry";

describe("Incidents API Integration Tests", () => {
  beforeEach(() => {
    // Reset mocks before each test
    mockEventPublisher.reset();
    mockServiceRegistry.reset();
  });

  describe("POST /incidents", () => {
    it("should publish event after creating incident", async () => {
      const newIncident = {
        type: "theft",
        location: {
          address: "123 Main St",
          neighborhood: "Downtown",
          coordinates: {
            latitude: 37.7749,
            longitude: -122.4194,
          },
        },
        description: "Bike theft reported",
      };

      const response = await request(app)
        .post("/api/v1/incidents")
        .send(newIncident)
        .expect(201);

      // Verify the incident was created
      expect(response.body).toHaveProperty("id");

      // Verify event was published
      expect(mockEventPublisher.getPublishedEvents()).toContainEqual({
        topic: "emergency.incidents.reported",
        data: expect.objectContaining({
          incidentId: response.body.id,
          type: "theft",
        }),
      });
    });

    it("should notify traffic service about incident", async () => {
      // Similar to above test but verify interaction with traffic service
      // through service registry mock
    });
  });
});
```

### 3. Unit Testing

Unit tests verify the correctness of individual components.

```typescript
// services/sample/tests/unit/services/resourceService.test.ts
// Pseudo-code for unit testing

import { ResourceService } from "../../../src/services/resourceService";
import { mockResourceRepository } from "../../../src/mocks/repositories";

describe("ResourceService", () => {
  let resourceService: ResourceService;

  beforeEach(() => {
    mockResourceRepository.reset();
    resourceService = new ResourceService(mockResourceRepository);
  });

  describe("getResources", () => {
    it("should retrieve a list of resources", async () => {
      mockResourceRepository.setResources([
        { id: "1", name: "Resource 1" },
        { id: "2", name: "Resource 2" },
      ]);

      const result = await resourceService.getResources({});

      expect(result.items).toHaveLength(2);
      expect(result.total).toBe(2);
    });

    it("should apply filters when provided", async () => {
      mockResourceRepository.setResources([
        { id: "1", name: "Resource 1", type: "A" },
        { id: "2", name: "Resource 2", type: "B" },
      ]);

      const result = await resourceService.getResources({ type: "A" });

      expect(result.items).toHaveLength(1);
      expect(result.items[0].id).toBe("1");
    });
  });

  describe("createResource", () => {
    it("should create a new resource", async () => {
      const newResource = { name: "New Resource" };

      const result = await resourceService.createResource(newResource);

      expect(result).toHaveProperty("id");
      expect(result.name).toBe("New Resource");
      expect(mockResourceRepository.getResources()).toContainEqual(
        expect.objectContaining({ name: "New Resource" }),
      );
    });
  });
});
```

### 4. End-to-End Testing

End-to-end tests verify the complete user journey across multiple services.

```typescript
// tests/e2e/citizen-emergency-flow.test.ts
// Pseudo-code for end-to-end testing

import request from "supertest";
import { setupTestEnvironment, teardownTestEnvironment } from "./environment";

describe("Citizen Emergency Reporting Flow", () => {
  let serviceUrls;

  beforeAll(async () => {
    // Start all required services in test mode
    serviceUrls = await setupTestEnvironment([
      "api-gateway",
      "iam",
      "citizen-services-requests",
      "emergency-services-police",
    ]);
  });

  afterAll(async () => {
    await teardownTestEnvironment();
  });

  it("should allow a citizen to report an emergency that gets routed to police", async () => {
    // Step 1: Get authentication token
    const authResponse = await request(serviceUrls.iam)
      .post("/oauth/token")
      .send({
        client_id: "citizen-app",
        client_secret: "test-secret",
        grant_type: "client_credentials",
        scope: "write:requests",
      });

    const token = authResponse.body.access_token;

    // Step 2: Submit service request through citizen services
    const requestResponse = await request(serviceUrls["api-gateway"])
      .post("/citizen/requests")
      .set("Authorization", `Bearer ${token}`)
      .send({
        category: "emergency",
        subcategory: "crime",
        location: {
          address: "123 Main St",
          neighborhood: "Downtown",
          coordinates: {
            latitude: 37.7749,
            longitude: -122.4194,
          },
        },
        description: "Suspicious activity",
        submittedBy: {
          name: "John Doe",
          phone: "555-123-4567",
        },
      });

    expect(requestResponse.status).toBe(201);
    const requestId = requestResponse.body.id;

    // Step 3: Verify request appears in police incidents after processing
    // May need retry logic for eventual consistency
    let policeIncident;
    for (let i = 0; i < 5; i++) {
      const policeResponse = await request(serviceUrls["api-gateway"])
        .get("/emergency/police/incidents")
        .set("Authorization", `Bearer ${token}`)
        .query({ externalRequestId: requestId });

      if (policeResponse.body.items.length > 0) {
        policeIncident = policeResponse.body.items[0];
        break;
      }

      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    expect(policeIncident).toBeDefined();
    expect(policeIncident.type).toBe("suspicious_activity");
    expect(policeIncident.status).toBe("reported");
  });
});
```

## Deployment Configuration

For the workshop, services are containerized using Docker and can be deployed locally using k3d, a lightweight Kubernetes distribution. This setup provides a realistic environment for participants while requiring minimal resources.

### 1. Docker Configuration

Each service includes a standardized Dockerfile:

```dockerfile
# services/sample/Dockerfile
FROM node:20-alpine

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy application code
COPY . .

# Build TypeScript
RUN npm run build

# Set environment variable
ENV NODE_ENV=production

# Expose port
EXPOSE 3000

# Start the service
CMD ["node", "dist/index.js"]
```

### 2. Docker Compose for Local Development

For local development, a docker-compose.yml file orchestrates all services:

```yaml
# docker-compose.yml
version: "3.8"

services:
  # Core infrastructure
  api-gateway:
    build: ./infrastructure/api-gateway
    ports:
      - "8000:8000"
    environment:
      - NODE_ENV=development
    depends_on:
      - iam-service
      - service-registry

  iam-service:
    build: ./infrastructure/iam
    ports:
      - "3001:3000"
    environment:
      - NODE_ENV=development
      - JWT_SECRET=workshop-secret-key

  service-registry:
    build: ./infrastructure/service-registry
    ports:
      - "3002:3000"
    environment:
      - NODE_ENV=development

  # Sample service
  sample-service:
    build: ./services/sample
    ports:
      - "3010:3000"
    environment:
      - NODE_ENV=development
      - SERVICE_REGISTRY_URL=http://service-registry:3000
      - IAM_URL=http://iam-service:3000
    depends_on:
      - service-registry
      - iam-service

  # Emergency services
  police-service:
    build: ./services/emergency-services/police
    ports:
      - "3011:3000"
    environment:
      - NODE_ENV=development
      - SERVICE_REGISTRY_URL=http://service-registry:3000
      - IAM_URL=http://iam-service:3000
    depends_on:
      - service-registry
      - iam-service

  # Other services follow similar pattern...

  # Mock third-party services for development
  mock-pubsub:
    image: messagebird/gcloud-pubsub-emulator
    ports:
      - "8085:8085"
```

### 3. Kubernetes Deployment

For a more realistic deployment, k3d is used to create a local Kubernetes cluster:

```bash
# scripts/setup-k3d.sh
#!/bin/bash

# Create k3d cluster
k3d cluster create city-services --api-port 6550 -p "8000:80@loadbalancer" --agents 2

# Set kubectl context
kubectl config use-context k3d-city-services

# Apply Kubernetes manifests
kubectl apply -f kubernetes/
```

Kubernetes manifests for each service:

```yaml
# kubernetes/sample-service.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: sample-service
  labels:
    app: sample-service
spec:
  replicas: 1
  selector:
    matchLabels:
      app: sample-service
  template:
    metadata:
      labels:
        app: sample-service
    spec:
      containers:
        - name: sample-service
          image: city-services/sample-service:latest
          imagePullPolicy: Never
          ports:
            - containerPort: 3000
          env:
            - name: NODE_ENV
              value: "production"
            - name: SERVICE_REGISTRY_URL
              value: "http://service-registry:3000"
            - name: IAM_URL
              value: "http://iam-service:3000"
          readinessProbe:
            httpGet:
              path: /api/v1/health
              port: 3000
            initialDelaySeconds: 5
            periodSeconds: 10
---
apiVersion: v1
kind: Service
metadata:
  name: sample-service
spec:
  selector:
    app: sample-service
  ports:
    - port: 3000
      targetPort: 3000
```

### 4. Workshop Script for Environment Setup

To streamline setup for workshop participants, a setup script automates the process:

```bash
# scripts/setup-workshop.sh
#!/bin/bash

echo "Setting up City Services Workshop Environment"

# Check prerequisites
command -v docker >/dev/null 2>&1 || { echo "Docker is required but not installed. Aborting."; exit 1; }
command -v k3d >/dev/null 2>&1 || { echo "k3d is required but not installed. Aborting."; exit 1; }
command -v kubectl >/dev/null 2>&1 || { echo "kubectl is required but not installed. Aborting."; exit 1; }
command -v node >/dev/null 2>&1 || { echo "Node.js is required but not installed. Aborting."; exit 1; }

# Clone repository if not already done
if [ ! -d "city-services" ]; then
  git clone https://github.com/example/city-services-workshop.git city-services
  cd city-services
else
  cd city-services
  git pull
fi

# Install dependencies
npm install

# Build docker images
docker-compose build

# Set up k3d cluster
./scripts/setup-k3d.sh

# Import Docker images to k3d
k3d image import city-services/api-gateway:latest city-services/iam-service:latest city-services/service-registry:latest city-services/sample-service:latest -c city-services

# Verify setup
echo "Verifying setup..."
kubectl get pods
echo "Waiting for services to start..."
sleep 10
kubectl get services

echo "Setup complete! Access the API Gateway at http://localhost:8000"
```

### 5. Service Mesh

For observability and more advanced networking features, a lightweight service mesh is included:

```yaml
# kubernetes/linkerd.yaml
# Simplified Linkerd configuration for the workshop
apiVersion: linkerd.io/v1alpha2
kind: ServiceProfile
metadata:
  name: sample-service.default.svc.cluster.local
  namespace: default
spec:
  routes:
    - name: get-resources
      condition:
        method: GET
        pathRegex: /api/v1/resources
      responseClasses:
        - condition:
            status:
              min: 200
              max: 299
          isSuccess: true
    - name: create-resource
      condition:
        method: POST
        pathRegex: /api/v1/resources
      responseClasses:
        - condition:
            status:
              min: 200
              max: 299
          isSuccess: true
```

This deployment configuration provides a realistic yet approachable environment for workshop participants to experience the complete API-first development lifecycle.

## Conclusion

This walking skeleton of the City Services API-first workshop provides a comprehensive foundation for exploring API-first principles in a realistic setting. The implementation demonstrates key concepts including:

1. **Contract-First Development** - All services begin with clear API specifications in OpenAPI 3.0 format before implementation begins.

2. **Service Independence** - Each city service operates independently but follows consistent patterns and communicates through well-defined interfaces.

3. **Infrastructure as Code** - All components, from the API gateway to the individual services, are defined in code and can be consistently deployed.

4. **Testing Strategies** - Multiple testing approaches ensure quality at all levels, from unit testing to end-to-end validation.

5. **Developer Experience** - Tools and scripts streamline the developer experience, making it accessible for workshop participants of varying skill levels.

### Limitations of the Walking Skeleton

This implementation intentionally simplifies certain aspects to focus on learning API-first principles:

1. **Authentication & Authorization** - A simplified OAuth service is provided rather than a production-grade implementation.

2. **Persistence** - Simple persistence layers are used instead of complex database schemas.

3. **Error Handling** - Basic error patterns are demonstrated without exhaustive error scenarios.

4. **Performance Optimization** - Services are designed for clarity rather than maximum performance.

### Next Steps for Workshop Development

To complete preparation for the workshop:

1. **Implement Sample Service** - Fully implement the Sample Service as a reference example for participants.

2. **Prepare Workshop Exercises** - Develop guided exercises for each section of the workshop.

3. **Create Documentation** - Provide comprehensive documentation for each component.

4. **Test Environment Setup** - Verify that all components can be deployed consistently across different platforms.

5. **Prepare Facilitator Guide** - Create detailed guides for workshop facilitators with troubleshooting tips.

The walking skeleton provides a solid foundation for a successful API-first workshop, giving participants hands-on experience with modern API development patterns in a realistic city services ecosystem.
