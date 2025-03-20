---
layout: layout.njk
---

# Building Your Repository Layer

Now that you've defined your data models, it's time to create the repository layer. This layer handles all data access operations - think of it as the bridge between your business logic and your data storage.

## What is a Repository?

The repository pattern is a design pattern that separates the logic for accessing data from your business logic. It provides a clean API for working with your data models, and hides the details of how data is stored and retrieved.

In our case, we'll use a simple in-memory storage approach for the workshop, but in a real application, repositories would typically interact with databases, APIs, or other data sources.

## Benefits of the Repository Pattern

- **Separation of concerns**: Your business logic doesn't need to know how data is stored
- **Testability**: You can easily mock repositories for testing
- **Flexibility**: You can change your data storage mechanism without affecting the rest of your code
- **Centralized data logic**: All data access logic is in one place

## Creating Your Repository

Let's implement a repository for one of your main resources. We'll use a simple in-memory approach for this workshop.

### 1. Create a Repository File

For each of your main resources, create a repository file in the `src/repositories` directory:

```bash
touch services/your-service-name/src/repositories/your-resource-repository.ts
```

For example, for a police service with patrols:

```bash
touch services/your-service-name/src/repositories/patrol-repository.ts
```

### 2. Implement the Basic Repository Structure

Here's a template for a basic repository:

```typescript
import { v4 as uuidv4 } from 'uuid';
import { YourResource, CreateYourResourceRequest, UpdateYourResourceRequest } from '../models/your-resource';

// In-memory storage
const resources: Record<string, YourResource> = {};

export const YourResourceRepository = {
  // Find all resources
  findAll: (): YourResource[] => {
    return Object.values(resources);
  },
  
  // Find a resource by ID
  findById: (id: string): YourResource | undefined => {
    return resources[id];
  },
  
  // Create a new resource
  create: (resource: CreateYourResourceRequest): YourResource => {
    const id = uuidv4();
    const newResource = { ...resource, id };
    resources[id] = newResource;
    return newResource;
  },
  
  // Update an existing resource
  update: (id: string, resource: UpdateYourResourceRequest): YourResource | undefined => {
    if (!resources[id]) return undefined;
    
    resources[id] = {
      ...resources[id],
      ...resource
    };
    
    return resources[id];
  },
  
  // Delete a resource
  delete: (id: string): boolean => {
    if (!resources[id]) return false;
    
    delete resources[id];
    return true;
  }
};
```

### 3. Implement a Real Repository

Let's implement a repository for a police patrol service as a concrete example:

```typescript
// src/repositories/patrol-repository.ts
import { v4 as uuidv4 } from 'uuid';
import { Patrol, CreatePatrolRequest, UpdatePatrolRequest, PatrolStatus } from '../models/patrol';

// In-memory storage
const patrols: Record<string, Patrol> = {};

// Pre-populate with some example data
const initializeData = () => {
  const patrol1: Patrol = {
    id: uuidv4(),
    type: 'CAR',
    location: { latitude: 40.7128, longitude: -74.0060 },
    officerCount: 2,
    status: PatrolStatus.AVAILABLE
  };
  
  const patrol2: Patrol = {
    id: uuidv4(),
    type: 'BIKE',
    location: { latitude: 40.7308, longitude: -73.9973 },
    officerCount: 1,
    status: PatrolStatus.AVAILABLE
  };
  
  patrols[patrol1.id] = patrol1;
  patrols[patrol2.id] = patrol2;
};

// Initialize data when the module is loaded
initializeData();

export const PatrolRepository = {
  // Find all patrols
  findAll: (): Patrol[] => {
    return Object.values(patrols);
  },
  
  // Find a patrol by ID
  findById: (id: string): Patrol | undefined => {
    return patrols[id];
  },
  
  // Find patrols by status
  findByStatus: (status: PatrolStatus): Patrol[] => {
    return Object.values(patrols).filter(patrol => patrol.status === status);
  },
  
  // Find available patrols
  findAvailable: (): Patrol[] => {
    return Object.values(patrols).filter(patrol => patrol.status === PatrolStatus.AVAILABLE);
  },
  
  // Find the nearest patrol to a location
  findNearest: (latitude: number, longitude: number): Patrol | undefined => {
    const availablePatrols = Object.values(patrols).filter(
      patrol => patrol.status === PatrolStatus.AVAILABLE
    );
    
    if (availablePatrols.length === 0) return undefined;
    
    // Calculate distance for each patrol using the Haversine formula
    return availablePatrols.reduce((nearest, patrol) => {
      const distToNearest = calculateDistance(
        latitude, longitude, 
        nearest.location.latitude, nearest.location.longitude
      );
      
      const distToPatrol = calculateDistance(
        latitude, longitude, 
        patrol.location.latitude, patrol.location.longitude
      );
      
      return distToPatrol < distToNearest ? patrol : nearest;
    }, availablePatrols[0]);
  },
  
  // Create a new patrol
  create: (patrol: CreatePatrolRequest): Patrol => {
    const id = uuidv4();
    const newPatrol = { ...patrol, id };
    patrols[id] = newPatrol;
    return newPatrol;
  },
  
  // Update an existing patrol
  update: (id: string, patrol: UpdatePatrolRequest): Patrol | undefined => {
    if (!patrols[id]) return undefined;
    
    patrols[id] = {
      ...patrols[id],
      ...patrol
    };
    
    return patrols[id];
  },
  
  // Delete a patrol
  delete: (id: string): boolean => {
    if (!patrols[id]) return false;
    
    delete patrols[id];
    return true;
  }
};

// Helper function to calculate distance between two points
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of the earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const d = R * c; // Distance in km
  return d;
}
```

### 4. Example Repositories for Different Services

Let's look at some examples for different city services:

#### Example: Fire Truck Repository

```typescript
// src/repositories/fire-truck-repository.ts
import { v4 as uuidv4 } from 'uuid';
import { FireTruck, TruckType } from '../models/fire-truck';

// In-memory storage
const trucks: Record<string, FireTruck> = {};

// Pre-populate with some example data
const initializeData = () => {
  const truck1: FireTruck = {
    id: uuidv4(),
    type: TruckType.PUMPER,
    location: { latitude: 40.7128, longitude: -74.0060 },
    crewCount: 4,
    waterCapacity: 2000,
    status: 'AVAILABLE'
  };
  
  const truck2: FireTruck = {
    id: uuidv4(),
    type: TruckType.LADDER,
    location: { latitude: 40.7308, longitude: -73.9973 },
    crewCount: 6,
    waterCapacity: 1000,
    status: 'AVAILABLE'
  };
  
  trucks[truck1.id] = truck1;
  trucks[truck2.id] = truck2;
};

// Initialize data when the module is loaded
initializeData();

export const FireTruckRepository = {
  findAll: (): FireTruck[] => {
    return Object.values(trucks);
  },
  
  findById: (id: string): FireTruck | undefined => {
    return trucks[id];
  },
  
  findByStatus: (status: string): FireTruck[] => {
    return Object.values(trucks).filter(truck => truck.status === status);
  },
  
  findByType: (type: TruckType): FireTruck[] => {
    return Object.values(trucks).filter(truck => truck.type === type);
  },
  
  // Add other query methods as needed
  
  create: (truck: Omit<FireTruck, 'id'>): FireTruck => {
    const id = uuidv4();
    const newTruck = { ...truck, id };
    trucks[id] = newTruck;
    return newTruck;
  },
  
  update: (id: string, truck: Partial<Omit<FireTruck, 'id'>>): FireTruck | undefined => {
    if (!trucks[id]) return undefined;
    
    trucks[id] = {
      ...trucks[id],
      ...truck
    };
    
    return trucks[id];
  },
  
  delete: (id: string): boolean => {
    if (!trucks[id]) return false;
    
    delete trucks[id];
    return true;
  }
};
```

#### Example: Power Plant Repository

```typescript
// src/repositories/power-plant-repository.ts
import { v4 as uuidv4 } from 'uuid';
import { PowerPlant, EnergySource } from '../models/power-plant';

// In-memory storage
const plants: Record<string, PowerPlant> = {};

// Pre-populate with some example data
const initializeData = () => {
  const plant1: PowerPlant = {
    id: uuidv4(),
    name: 'Downtown Nuclear',
    location: { latitude: 40.7128, longitude: -74.0060 },
    capacity: 1000,
    currentOutput: 750,
    source: EnergySource.NUCLEAR,
    status: 'ONLINE',
    efficiency: 95
  };
  
  const plant2: PowerPlant = {
    id: uuidv4(),
    name: 'Westside Solar Farm',
    location: { latitude: 40.7308, longitude: -73.9973 },
    capacity: 500,
    currentOutput: 300,
    source: EnergySource.SOLAR,
    status: 'ONLINE',
    efficiency: 80
  };
  
  plants[plant1.id] = plant1;
  plants[plant2.id] = plant2;
};

// Initialize data when the module is loaded
initializeData();

export const PowerPlantRepository = {
  findAll: (): PowerPlant[] => {
    return Object.values(plants);
  },
  
  findById: (id: string): PowerPlant | undefined => {
    return plants[id];
  },
  
  findByStatus: (status: string): PowerPlant[] => {
    return Object.values(plants).filter(plant => plant.status === status);
  },
  
  findBySource: (source: EnergySource): PowerPlant[] => {
    return Object.values(plants).filter(plant => plant.source === source);
  },
  
  getTotalCapacity: (): number => {
    return Object.values(plants)
      .filter(plant => plant.status === 'ONLINE')
      .reduce((total, plant) => total + plant.capacity, 0);
  },
  
  getCurrentOutput: (): number => {
    return Object.values(plants)
      .filter(plant => plant.status === 'ONLINE')
      .reduce((total, plant) => total + plant.currentOutput, 0);
  },
  
  create: (plant: Omit<PowerPlant, 'id'>): PowerPlant => {
    const id = uuidv4();
    const newPlant = { ...plant, id };
    plants[id] = newPlant;
    return newPlant;
  },
  
  update: (id: string, plant: Partial<Omit<PowerPlant, 'id'>>): PowerPlant | undefined => {
    if (!plants[id]) return undefined;
    
    plants[id] = {
      ...plants[id],
      ...plant
    };
    
    return plants[id];
  },
  
  delete: (id: string): boolean => {
    if (!plants[id]) return false;
    
    delete plants[id];
    return true;
  }
};
```

### 5. Additional Repository Patterns

As your service grows, you might want to implement more sophisticated repository patterns:

#### Filtering and Pagination

```typescript
export const PatrolRepository = {
  // ... other methods
  
  // Find patrols with filtering and pagination
  findWithFilters: (options: {
    status?: PatrolStatus;
    type?: PatrolType;
    limit?: number;
    offset?: number;
  }): { data: Patrol[]; total: number } => {
    let result = Object.values(patrols);
    
    // Apply filters
    if (options.status) {
      result = result.filter(patrol => patrol.status === options.status);
    }
    
    if (options.type) {
      result = result.filter(patrol => patrol.type === options.type);
    }
    
    const total = result.length;
    
    // Apply pagination
    if (options.limit !== undefined && options.offset !== undefined) {
      result = result.slice(options.offset, options.offset + options.limit);
    }
    
    return { data: result, total };
  }
};
```

#### Searching

```typescript
export const PatrolRepository = {
  // ... other methods
  
  // Search patrols
  search: (query: string): Patrol[] => {
    const lowercaseQuery = query.toLowerCase();
    
    return Object.values(patrols).filter(patrol => 
      patrol.id.toLowerCase().includes(lowercaseQuery) || 
      patrol.type.toLowerCase().includes(lowercaseQuery) ||
      (patrol.activeCall && patrol.activeCall.toLowerCase().includes(lowercaseQuery))
    );
  }
};
```

## Next Steps

You've now created the repository layer for your service, which handles all data operations. Next, let's build the service layer, which will contain your business logic.

Head over to [Creating Your Service Layer](./02-5-services) 