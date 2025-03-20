---
layout: layout.njk
---

# Implementing Your Data Models

Now that your project structure is set up, it's time to create the TypeScript interfaces that will represent your data. These models will match the schemas defined in your OpenAPI specification.

## Why Models Matter

In TypeScript, interfaces define the shape of your data objects. They provide several benefits:

- **Type checking**: Catch errors at compile time instead of runtime
- **Code completion**: Get helpful hints in your code editor
- **Documentation**: Make your code self-documenting
- **Consistency**: Ensure all parts of your application use the same data structure

## Creating Models from Your API Schema

Let's look at how to translate your OpenAPI schemas into TypeScript interfaces:

### 1. Review Your API Schemas

First, open your API specification (`api/openapi.yaml`) and find the schema definitions for your resources. These are typically under the `components.schemas` section:

```yaml
components:
  schemas:
    Patrol:
      type: object
      required:
        - id
        - location
        - type
        - status
      properties:
        id:
          type: string
          format: uuid
        location:
          type: object
          properties:
            latitude:
              type: number
              format: float
            longitude:
              type: number
              format: float
        type:
          type: string
          enum: [FOOT, CAR, BIKE, HORSE]
        activeCall:
          type: string
          nullable: true
        officerCount:
          type: integer
          minimum: 1
        status:
          type: string
          enum: [AVAILABLE, BUSY, OUT_OF_SERVICE]
```

### 2. Create Model Files

Create a TypeScript file for each main resource in your `src/models` directory:

```bash
touch services/your-service-name/src/models/your-resource.ts
```

For example, if you're building the Police Service, you might create:

```bash
touch services/your-service-name/src/models/patrol.ts
touch services/your-service-name/src/models/call.ts
```

### 3. Define Your TypeScript Interfaces

In each model file, create interfaces that match your OpenAPI schemas:

Here's how you might implement the Patrol model from the example above:

```typescript
// src/models/patrol.ts

/**
 * Types of patrol available in the police department
 */
export enum PatrolType {
  FOOT = 'FOOT',
  CAR = 'CAR',
  BIKE = 'BIKE',
  HORSE = 'HORSE'
}

/**
 * Possible statuses for a patrol
 */
export enum PatrolStatus {
  AVAILABLE = 'AVAILABLE',
  BUSY = 'BUSY',
  OUT_OF_SERVICE = 'OUT_OF_SERVICE'
}

/**
 * Geographic location with latitude and longitude
 */
export interface Location {
  latitude: number;
  longitude: number;
}

/**
 * Represents a police patrol unit
 */
export interface Patrol {
  id: string;
  location: Location;
  type: PatrolType;
  activeCall?: string; // ID of the active call, if any
  officerCount: number;
  status: PatrolStatus;
}

/**
 * Data needed to create a new patrol (no ID required as it will be generated)
 */
export type CreatePatrolRequest = Omit<Patrol, 'id'>;

/**
 * Data needed to update an existing patrol (all fields optional)
 */
export type UpdatePatrolRequest = Partial<Omit<Patrol, 'id'>>;
```

### Tips for Creating Models

When creating your models, keep these tips in mind:

#### Use TypeScript Features

- **Enums** for fixed sets of values
- **Interfaces** for object types
- **Optional properties** (with `?`) for nullable fields
- **Type aliases** with `Omit`, `Partial`, and other type utilities for derived types
- **JSDoc comments** to document your types

#### Keep Models Clean

- Focus on data structure, not behavior
- Don't include methods in your interfaces
- Don't include implementation details (like database IDs)
- Keep models reusable across different parts of your application

#### Create Helper Types for API Operations

Consider creating specific types for API operations, such as:

- **Request types**: Types for data sent to your API
- **Response types**: Types for data returned from your API
- **Create types**: Types for creating new resources (usually without an ID)
- **Update types**: Types for updating existing resources (usually with optional fields)

### Complete Example

Let's see a more complete example for a Police Service with multiple resources:

#### Patrol Model

```typescript
// src/models/patrol.ts
export enum PatrolType {
  FOOT = 'FOOT',
  CAR = 'CAR',
  BIKE = 'BIKE',
  HORSE = 'HORSE'
}

export enum PatrolStatus {
  AVAILABLE = 'AVAILABLE',
  BUSY = 'BUSY',
  OUT_OF_SERVICE = 'OUT_OF_SERVICE'
}

export interface Location {
  latitude: number;
  longitude: number;
}

export interface Patrol {
  id: string;
  location: Location;
  type: PatrolType;
  activeCall?: string;
  officerCount: number;
  status: PatrolStatus;
}

export type CreatePatrolRequest = Omit<Patrol, 'id'>;
export type UpdatePatrolRequest = Partial<Omit<Patrol, 'id'>>;
```

#### Call Model

```typescript
// src/models/call.ts
import { Location } from './patrol';

export enum CallType {
  BURGLARY = 'BURGLARY',
  ASSAULT = 'ASSAULT',
  TRAFFIC_ACCIDENT = 'TRAFFIC_ACCIDENT',
  NOISE_COMPLAINT = 'NOISE_COMPLAINT',
  OTHER = 'OTHER'
}

export enum CallStatus {
  PENDING = 'PENDING',
  ASSIGNED = 'ASSIGNED',
  RESOLVED = 'RESOLVED',
  CANCELLED = 'CANCELLED'
}

export interface Call {
  id: string;
  type: CallType;
  location: Location;
  description: string;
  reportedAt: string; // ISO date string
  status: CallStatus;
  assignedPatrolId?: string;
  priority: 1 | 2 | 3; // 1 = highest, 3 = lowest
}

export type CreateCallRequest = Omit<Call, 'id' | 'status' | 'reportedAt' | 'assignedPatrolId'>;
export type UpdateCallRequest = Partial<Omit<Call, 'id' | 'reportedAt'>>;
```

#### Index File

It's also a good practice to create an index.ts file in your models directory to export all your models:

```typescript
// src/models/index.ts
export * from './patrol';
export * from './call';
// Add other model exports as needed
```

This allows importing multiple models in a cleaner way:

```typescript
import { Patrol, Call, PatrolType, CallStatus } from '../models';
```

## Example for Different Services

Depending on your assigned service, you'll need different models. Here are some examples:

### For a Fire Service

```typescript
// src/models/fire-truck.ts
export enum TruckType {
  PUMPER = 'PUMPER',
  LADDER = 'LADDER',
  RESCUE = 'RESCUE',
  TANKER = 'TANKER'
}

export interface FireTruck {
  id: string;
  type: TruckType;
  location: {
    latitude: number;
    longitude: number;
  };
  crewCount: number;
  waterCapacity: number; // liters
  status: 'AVAILABLE' | 'RESPONDING' | 'RETURNING' | 'MAINTENANCE';
  activeCallId?: string;
}
```

### For a Power Plant

```typescript
// src/models/power-plant.ts
export enum EnergySource {
  COAL = 'COAL',
  NATURAL_GAS = 'NATURAL_GAS',
  NUCLEAR = 'NUCLEAR',
  SOLAR = 'SOLAR',
  WIND = 'WIND',
  HYDRO = 'HYDRO'
}

export interface PowerPlant {
  id: string;
  name: string;
  location: {
    latitude: number;
    longitude: number;
  };
  capacity: number; // megawatts
  currentOutput: number; // megawatts
  source: EnergySource;
  status: 'ONLINE' | 'OFFLINE' | 'MAINTENANCE';
  efficiency: number; // percentage
}
```

## Next Steps

Now that you've defined your data models, it's time to move on to the repository layer, which will handle data storage and retrieval. Let's create some repositories for your resources.

Head over to [Building Your Repository Layer](../02-4-repositories) 