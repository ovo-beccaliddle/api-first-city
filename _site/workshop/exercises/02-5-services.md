# Creating Your Service Layer

Now that you have your data models and repositories set up, it's time to create the service layer. This layer contains your business logic and coordinates between your controllers (which handle HTTP requests) and your repositories (which handle data access).

## Why Do We Need a Service Layer?

The service layer is where your application's actual business logic lives:

- **Separation of concerns**: It separates business logic from controller logic and data access
- **Reusability**: Business logic can be reused across different controllers
- **Testability**: Business rules can be easily tested in isolation
- **Simplicity**: Controllers stay simple (just handling HTTP) and repositories stay focused on data access

Think of it this way:
- **Controllers** decide how to handle HTTP requests and shape responses
- **Services** implement the business rules and orchestrate data operations
- **Repositories** handle the actual data access

## Creating Your Service

Let's implement the service layer for one of your main resources.

### 1. Create a Service File

For each of your main resources, create a service file in the `src/services` directory:

```bash
touch services/your-service-name/src/services/your-resource-service.ts
```

For example:

```bash
touch services/your-service-name/src/services/patrol-service.ts
```

### 2. Implement the Basic Service Structure

A service typically exports an object with methods that implement your business logic. Each method will usually call one or more repository methods and apply some business rules.

Here's a template for a basic service:

```typescript
import { YourResource, CreateYourResourceRequest, UpdateYourResourceRequest } from '../models/your-resource';
import { YourResourceRepository } from '../repositories/your-resource-repository';

export const YourResourceService = {
  // Get all resources
  getAll: (): YourResource[] => {
    return YourResourceRepository.findAll();
  },
  
  // Get a resource by ID
  getById: (id: string): YourResource | undefined => {
    return YourResourceRepository.findById(id);
  },
  
  // Create a new resource
  create: (resource: CreateYourResourceRequest): YourResource => {
    // Apply any business rules here
    
    return YourResourceRepository.create(resource);
  },
  
  // Update an existing resource
  update: (id: string, resource: UpdateYourResourceRequest): YourResource | undefined => {
    // Apply any business rules here
    
    return YourResourceRepository.update(id, resource);
  },
  
  // Delete a resource
  delete: (id: string): boolean => {
    return YourResourceRepository.delete(id);
  }
  
  // Add more business logic methods as needed
};
```

### 3. Implement a Real Service

Let's implement a service for the police patrol example we've been using:

```typescript
// src/services/patrol-service.ts
import { Patrol, PatrolType, PatrolStatus, CreatePatrolRequest, UpdatePatrolRequest } from '../models/patrol';
import { PatrolRepository } from '../repositories/patrol-repository';

export const PatrolService = {
  // Get all patrols
  getAllPatrols: (): Patrol[] => {
    return PatrolRepository.findAll();
  },
  
  // Get a patrol by ID
  getPatrolById: (id: string): Patrol | undefined => {
    return PatrolRepository.findById(id);
  },
  
  // Get patrols by status
  getPatrolsByStatus: (status: PatrolStatus): Patrol[] => {
    return PatrolRepository.findByStatus(status);
  },
  
  // Get available patrols
  getAvailablePatrols: (): Patrol[] => {
    return PatrolRepository.findAvailable();
  },
  
  // Create a new patrol
  createPatrol: (patrol: CreatePatrolRequest): Patrol => {
    // Ensure the patrol starts with AVAILABLE status if not specified
    if (!patrol.status) {
      patrol.status = PatrolStatus.AVAILABLE;
    }
    
    // Validate officer count based on patrol type
    // Business rule: Car patrols need at least 2 officers, others can have 1
    if (patrol.type === PatrolType.CAR && patrol.officerCount < 2) {
      throw new Error('Car patrols require at least 2 officers');
    }
    
    return PatrolRepository.create(patrol);
  },
  
  // Update a patrol's location
  updatePatrolLocation: (id: string, latitude: number, longitude: number): Patrol | undefined => {
    return PatrolRepository.update(id, {
      location: { latitude, longitude }
    });
  },
  
  // Assign a patrol to a call
  assignToCall: (patrolId: string, callId: string): Patrol | undefined => {
    const patrol = PatrolRepository.findById(patrolId);
    
    // Business rule: Only available patrols can be assigned
    if (!patrol || patrol.status !== PatrolStatus.AVAILABLE) {
      return undefined;
    }
    
    return PatrolRepository.update(patrolId, {
      activeCall: callId,
      status: PatrolStatus.BUSY
    });
  },
  
  // Complete a call and make patrol available again
  completeCall: (patrolId: string): Patrol | undefined => {
    const patrol = PatrolRepository.findById(patrolId);
    
    // Business rule: Only patrols on active calls can complete them
    if (!patrol || !patrol.activeCall) {
      return undefined;
    }
    
    return PatrolRepository.update(patrolId, {
      activeCall: undefined,
      status: PatrolStatus.AVAILABLE
    });
  },
  
  // Find the nearest available patrol to a location
  findNearestPatrol: (latitude: number, longitude: number): Patrol | undefined => {
    return PatrolRepository.findNearest(latitude, longitude);
  },
  
  // Take a patrol out of service
  takeOutOfService: (patrolId: string, reason: string): Patrol | undefined => {
    const patrol = PatrolRepository.findById(patrolId);
    
    // Can't take a patrol with an active call out of service
    if (!patrol || patrol.activeCall) {
      return undefined;
    }
    
    // In a real app, we might log the reason to a database
    console.log(`Patrol ${patrolId} taken out of service: ${reason}`);
    
    return PatrolRepository.update(patrolId, {
      status: PatrolStatus.OUT_OF_SERVICE
    });
  },
  
  // Return a patrol to service
  returnToService: (patrolId: string): Patrol | undefined => {
    const patrol = PatrolRepository.findById(patrolId);
    
    // Only out-of-service patrols can return to service
    if (!patrol || patrol.status !== PatrolStatus.OUT_OF_SERVICE) {
      return undefined;
    }
    
    return PatrolRepository.update(patrolId, {
      status: PatrolStatus.AVAILABLE
    });
  },
  
  // Delete a patrol
  deletePatrol: (id: string): boolean => {
    const patrol = PatrolRepository.findById(id);
    
    // Business rule: Can't delete a patrol that's on a call
    if (patrol && patrol.activeCall) {
      throw new Error('Cannot delete a patrol that is currently on a call');
    }
    
    return PatrolRepository.delete(id);
  }
};
```

### 4. Example Services for Different City Services

Let's look at how services might be implemented for different city services:

#### Example: Fire Truck Service

```typescript
// src/services/fire-truck-service.ts
import { FireTruck, TruckType } from '../models/fire-truck';
import { FireTruckRepository } from '../repositories/fire-truck-repository';

export const FireTruckService = {
  getAllTrucks: (): FireTruck[] => {
    return FireTruckRepository.findAll();
  },
  
  getTruckById: (id: string): FireTruck | undefined => {
    return FireTruckRepository.findById(id);
  },
  
  getAvailableTrucks: (): FireTruck[] => {
    return FireTruckRepository.findByStatus('AVAILABLE');
  },
  
  createTruck: (truck: Omit<FireTruck, 'id'>): FireTruck => {
    // Business rule: Water capacity validation based on truck type
    if (truck.type === TruckType.PUMPER && truck.waterCapacity < 1000) {
      throw new Error('Pumper trucks must have at least 1000L water capacity');
    }
    
    // Business rule: Crew count validation based on truck type
    const minCrewCount = truck.type === TruckType.LADDER ? 5 : 3;
    if (truck.crewCount < minCrewCount) {
      throw new Error(`${truck.type} trucks require at least ${minCrewCount} crew members`);
    }
    
    return FireTruckRepository.create(truck);
  },
  
  dispatchTruck: (truckId: string, emergencyId: string): FireTruck | undefined => {
    const truck = FireTruckRepository.findById(truckId);
    
    // Can only dispatch available trucks
    if (!truck || truck.status !== 'AVAILABLE') {
      return undefined;
    }
    
    return FireTruckRepository.update(truckId, {
      status: 'RESPONDING',
      activeCallId: emergencyId
    });
  },
  
  completeMission: (truckId: string): FireTruck | undefined => {
    const truck = FireTruckRepository.findById(truckId);
    
    if (!truck || !truck.activeCallId) {
      return undefined;
    }
    
    return FireTruckRepository.update(truckId, {
      status: 'RETURNING',
      activeCallId: undefined
    });
  },
  
  returnToStation: (truckId: string): FireTruck | undefined => {
    const truck = FireTruckRepository.findById(truckId);
    
    if (!truck || truck.status !== 'RETURNING') {
      return undefined;
    }
    
    return FireTruckRepository.update(truckId, {
      status: 'AVAILABLE'
    });
  },
  
  findTrucksForEmergency: (emergencyType: string): FireTruck[] => {
    // Business logic to determine which types of trucks are needed
    // based on the type of emergency
    const neededTypes: TruckType[] = [];
    
    if (emergencyType === 'BUILDING_FIRE') {
      neededTypes.push(TruckType.PUMPER, TruckType.LADDER);
    } else if (emergencyType === 'FOREST_FIRE') {
      neededTypes.push(TruckType.PUMPER, TruckType.TANKER);
    } else if (emergencyType === 'CAR_ACCIDENT') {
      neededTypes.push(TruckType.RESCUE);
    } else {
      neededTypes.push(TruckType.PUMPER); // Default
    }
    
    // Find available trucks of the needed types
    const availableTrucks = FireTruckRepository.findByStatus('AVAILABLE');
    return availableTrucks.filter(truck => neededTypes.includes(truck.type));
  }
};
```

#### Example: Power Plant Service

```typescript
// src/services/power-plant-service.ts
import { PowerPlant, EnergySource } from '../models/power-plant';
import { PowerPlantRepository } from '../repositories/power-plant-repository';

export const PowerPlantService = {
  getAllPlants: (): PowerPlant[] => {
    return PowerPlantRepository.findAll();
  },
  
  getPlantById: (id: string): PowerPlant | undefined => {
    return PowerPlantRepository.findById(id);
  },
  
  getOnlinePlants: (): PowerPlant[] => {
    return PowerPlantRepository.findByStatus('ONLINE');
  },
  
  getTotalCapacity: (): number => {
    return PowerPlantRepository.getTotalCapacity();
  },
  
  getCurrentOutput: (): number => {
    return PowerPlantRepository.getCurrentOutput();
  },
  
  // Check if the city has enough power capacity
  hasEnoughCapacity: (requiredCapacity: number): boolean => {
    const availableCapacity = PowerPlantService.getTotalCapacity();
    const currentOutput = PowerPlantService.getCurrentOutput();
    const remainingCapacity = availableCapacity - currentOutput;
    
    return remainingCapacity >= requiredCapacity;
  },
  
  // Business logic to request more power output
  increaseOutput: (plantId: string, amount: number): PowerPlant | undefined => {
    const plant = PowerPlantRepository.findById(plantId);
    
    if (!plant || plant.status !== 'ONLINE') {
      return undefined;
    }
    
    // Can't exceed capacity
    if (plant.currentOutput + amount > plant.capacity) {
      throw new Error(`Cannot increase output by ${amount}MW, would exceed plant capacity`);
    }
    
    return PowerPlantRepository.update(plantId, {
      currentOutput: plant.currentOutput + amount
    });
  },
  
  // Business logic to reduce power output
  decreaseOutput: (plantId: string, amount: number): PowerPlant | undefined => {
    const plant = PowerPlantRepository.findById(plantId);
    
    if (!plant || plant.status !== 'ONLINE') {
      return undefined;
    }
    
    // Can't go below minimum output (we'll say 10% of capacity for this example)
    const minimumOutput = plant.capacity * 0.1;
    if (plant.currentOutput - amount < minimumOutput) {
      throw new Error(`Cannot decrease output by ${amount}MW, would go below minimum output`);
    }
    
    return PowerPlantRepository.update(plantId, {
      currentOutput: plant.currentOutput - amount
    });
  },
  
  // Calculate power plant efficiency
  calculateEfficiency: (plantId: string): number | undefined => {
    const plant = PowerPlantRepository.findById(plantId);
    
    if (!plant) {
      return undefined;
    }
    
    // Business logic: different sources have different efficiency formulas
    // This is just a simple example
    let baseEfficiency = 0;
    
    switch (plant.source) {
      case EnergySource.NUCLEAR:
        baseEfficiency = 90;
        break;
      case EnergySource.SOLAR:
        baseEfficiency = 75;
        break;
      case EnergySource.WIND:
        baseEfficiency = 70;
        break;
      default:
        baseEfficiency = 60;
    }
    
    // Current load affects efficiency
    const loadFactor = plant.currentOutput / plant.capacity;
    // Most efficient at 80-90% capacity
    const loadEfficiency = 100 - Math.abs(0.85 - loadFactor) * 20;
    
    const efficiency = (baseEfficiency + loadEfficiency) / 2;
    
    return Math.round(efficiency);
  },
  
  // Schedule maintenance for a plant
  scheduleMaintenance: (plantId: string, startDate: Date): PowerPlant | undefined => {
    const plant = PowerPlantRepository.findById(plantId);
    
    if (!plant) {
      return undefined;
    }
    
    // Business rule: Can't schedule maintenance if it would leave us with insufficient capacity
    const otherPlantsCapacity = PowerPlantService.getTotalCapacity() - plant.capacity;
    const currentOutput = PowerPlantService.getCurrentOutput() - plant.currentOutput;
    
    if (currentOutput > otherPlantsCapacity * 0.9) {
      throw new Error('Cannot schedule maintenance - would leave insufficient reserve capacity');
    }
    
    // In a real app, we'd store the maintenance schedule somewhere
    console.log(`Maintenance scheduled for plant ${plantId} starting on ${startDate.toISOString()}`);
    
    return plant;
  }
};
```

### 5. Advanced Service Patterns

As your service grows, you might want to implement more sophisticated patterns:

#### Handling Asynchronous Operations

Services often need to handle asynchronous operations, like API calls or database queries:

```typescript
import { Patrol, PatrolStatus } from '../models/patrol';
import { PatrolRepository } from '../repositories/patrol-repository';
import { NotificationService } from './notification-service';

export const PatrolService = {
  // ... other methods
  
  // Asynchronously assign a patrol to a call
  assignToCall: async (patrolId: string, callId: string): Promise<Patrol | undefined> => {
    const patrol = PatrolRepository.findById(patrolId);
    
    if (!patrol || patrol.status !== PatrolStatus.AVAILABLE) {
      return undefined;
    }
    
    // Update the patrol
    const updatedPatrol = PatrolRepository.update(patrolId, {
      activeCall: callId,
      status: PatrolStatus.BUSY
    });
    
    if (updatedPatrol) {
      // Notify other systems that the patrol has been assigned
      await NotificationService.sendNotification('PATROL_ASSIGNED', {
        patrolId,
        callId,
        timestamp: new Date().toISOString()
      });
      
      // Log the assignment
      console.log(`Patrol ${patrolId} assigned to call ${callId}`);
    }
    
    return updatedPatrol;
  }
};
```

#### Implementing Domain Events

For more complex business logic, you might want to implement a domain event system:

```typescript
// src/services/event-bus.ts
type EventHandler<T> = (data: T) => void | Promise<void>;

export class EventBus {
  private static handlers: Record<string, EventHandler<any>[]> = {};
  
  static subscribe<T>(eventType: string, handler: EventHandler<T>): void {
    if (!this.handlers[eventType]) {
      this.handlers[eventType] = [];
    }
    this.handlers[eventType].push(handler);
  }
  
  static async publish<T>(eventType: string, data: T): Promise<void> {
    const handlers = this.handlers[eventType] || [];
    
    await Promise.all(handlers.map(handler => handler(data)));
  }
}

// Using the event bus in your service
import { EventBus } from './event-bus';

export const PatrolService = {
  // ... other methods
  
  completeCall: async (patrolId: string): Promise<Patrol | undefined> => {
    const patrol = PatrolRepository.findById(patrolId);
    
    if (!patrol || !patrol.activeCall) {
      return undefined;
    }
    
    const callId = patrol.activeCall;
    
    const updatedPatrol = PatrolRepository.update(patrolId, {
      activeCall: undefined,
      status: PatrolStatus.AVAILABLE
    });
    
    if (updatedPatrol) {
      // Publish a domain event
      await EventBus.publish('CallCompleted', {
        patrolId,
        callId,
        timestamp: new Date().toISOString()
      });
    }
    
    return updatedPatrol;
  }
};

// Register event handlers elsewhere in your code
EventBus.subscribe('CallCompleted', async (data) => {
  console.log(`Call ${data.callId} completed by patrol ${data.patrolId}`);
  // Update call status, generate reports, etc.
});
```

## Next Steps

You've now created the service layer, which contains the business logic for your application. Next, let's implement the controllers, which will handle HTTP requests and call the appropriate service methods.

Head over to [Implementing Your Controllers](./02-6-controllers.md) 