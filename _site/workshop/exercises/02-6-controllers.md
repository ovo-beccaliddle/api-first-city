# Implementing Your Controllers

Now that you've set up your models, repositories, and services, it's time to create the controllers. Controllers are the components that handle HTTP requests and send HTTP responses. They're the bridge between the outside world and your application's business logic.

## What Are Controllers?

In a RESTful API, controllers are responsible for:

- **Parsing request data** from URL parameters, query strings, and request bodies
- **Validating inputs** (although we're doing most of this with OpenAPI validation)
- **Calling the appropriate service methods** with the parsed inputs
- **Formatting responses** to match your API specification
- **Handling errors** and returning appropriate status codes

Think of controllers as the "traffic cops" of your application - they direct incoming requests to the right place and ensure that responses go back out in the right format.

## Creating Your Controllers

Let's implement controllers for one of your main resources.

### 1. Create a Controller File

For each of your main resources, create a controller file in the `src/controllers` directory:

```bash
touch services/your-service-name/src/controllers/your-resource-controller.ts
```

For example:

```bash
touch services/your-service-name/src/controllers/patrol-controller.ts
```

### 2. Implement the Basic Controller Structure

A controller typically exports a router that handles different HTTP methods for a specific resource. Here's a template for a basic controller:

```typescript
import { Router, Request, Response, NextFunction } from 'express';
import { YourResourceService } from '../services/your-resource-service';
import { CreateYourResourceRequest, UpdateYourResourceRequest } from '../models/your-resource';

const router = Router();

// GET /your-resources
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const resources = YourResourceService.getAll();
    res.json(resources);
  } catch (error) {
    next(error);
  }
});

// GET /your-resources/:id
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const resource = YourResourceService.getById(req.params.id);
    
    if (!resource) {
      return res.status(404).json({ error: 'Resource not found' });
    }
    
    res.json(resource);
  } catch (error) {
    next(error);
  }
});

// POST /your-resources
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const newResource = YourResourceService.create(req.body as CreateYourResourceRequest);
    res.status(201).json(newResource);
  } catch (error) {
    next(error);
  }
});

// PUT /your-resources/:id
router.put('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const updatedResource = YourResourceService.update(
      req.params.id, 
      req.body as UpdateYourResourceRequest
    );
    
    if (!updatedResource) {
      return res.status(404).json({ error: 'Resource not found' });
    }
    
    res.json(updatedResource);
  } catch (error) {
    next(error);
  }
});

// DELETE /your-resources/:id
router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const deleted = YourResourceService.delete(req.params.id);
    
    if (!deleted) {
      return res.status(404).json({ error: 'Resource not found' });
    }
    
    res.status(204).end();
  } catch (error) {
    next(error);
  }
});

export default router;
```

### 3. Implement a Real Controller

Let's implement a controller for the police patrol example we've been using:

```typescript
// src/controllers/patrol-controller.ts
import { Router, Request, Response, NextFunction } from 'express';
import { PatrolService } from '../services/patrol-service';
import { CreatePatrolRequest, UpdatePatrolRequest, PatrolStatus } from '../models/patrol';

const router = Router();

// GET /patrols
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Check if we should filter by status
    const status = req.query.status as PatrolStatus | undefined;
    
    if (status) {
      const patrols = PatrolService.getPatrolsByStatus(status);
      return res.json(patrols);
    }
    
    // Otherwise, return all patrols
    const patrols = PatrolService.getAllPatrols();
    res.json(patrols);
  } catch (error) {
    next(error);
  }
});

// GET /patrols/available
router.get('/available', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const patrols = PatrolService.getAvailablePatrols();
    res.json(patrols);
  } catch (error) {
    next(error);
  }
});

// GET /patrols/:id
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const patrol = PatrolService.getPatrolById(req.params.id);
    
    if (!patrol) {
      return res.status(404).json({ error: 'Patrol not found' });
    }
    
    res.json(patrol);
  } catch (error) {
    next(error);
  }
});

// POST /patrols
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const newPatrol = PatrolService.createPatrol(req.body as CreatePatrolRequest);
    res.status(201).json(newPatrol);
  } catch (error) {
    next(error);
  }
});

// PUT /patrols/:id
router.put('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const updatedPatrol = PatrolService.update(
      req.params.id, 
      req.body as UpdatePatrolRequest
    );
    
    if (!updatedPatrol) {
      return res.status(404).json({ error: 'Patrol not found' });
    }
    
    res.json(updatedPatrol);
  } catch (error) {
    next(error);
  }
});

// PUT /patrols/:id/location
router.put('/:id/location', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { latitude, longitude } = req.body;
    
    if (typeof latitude !== 'number' || typeof longitude !== 'number') {
      return res.status(400).json({ error: 'Invalid location coordinates' });
    }
    
    const updatedPatrol = PatrolService.updatePatrolLocation(
      req.params.id,
      latitude,
      longitude
    );
    
    if (!updatedPatrol) {
      return res.status(404).json({ error: 'Patrol not found' });
    }
    
    res.json(updatedPatrol);
  } catch (error) {
    next(error);
  }
});

// PUT /patrols/:id/assign
router.put('/:id/assign', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { callId } = req.body;
    
    if (!callId) {
      return res.status(400).json({ error: 'callId is required' });
    }
    
    const updatedPatrol = PatrolService.assignToCall(
      req.params.id,
      callId
    );
    
    if (!updatedPatrol) {
      return res.status(404).json({ error: 'Patrol not found or unavailable' });
    }
    
    res.json(updatedPatrol);
  } catch (error) {
    next(error);
  }
});

// PUT /patrols/:id/complete
router.put('/:id/complete', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const updatedPatrol = PatrolService.completeCall(req.params.id);
    
    if (!updatedPatrol) {
      return res.status(404).json({ error: 'Patrol not found or not on active call' });
    }
    
    res.json(updatedPatrol);
  } catch (error) {
    next(error);
  }
});

// PUT /patrols/:id/out-of-service
router.put('/:id/out-of-service', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { reason } = req.body;
    
    if (!reason) {
      return res.status(400).json({ error: 'reason is required' });
    }
    
    const updatedPatrol = PatrolService.takeOutOfService(
      req.params.id,
      reason
    );
    
    if (!updatedPatrol) {
      return res.status(404).json({ error: 'Patrol not found or on active call' });
    }
    
    res.json(updatedPatrol);
  } catch (error) {
    next(error);
  }
});

// PUT /patrols/:id/return-to-service
router.put('/:id/return-to-service', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const updatedPatrol = PatrolService.returnToService(req.params.id);
    
    if (!updatedPatrol) {
      return res.status(404).json({ error: 'Patrol not found or not out of service' });
    }
    
    res.json(updatedPatrol);
  } catch (error) {
    next(error);
  }
});

// DELETE /patrols/:id
router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const deleted = PatrolService.deletePatrol(req.params.id);
    
    if (!deleted) {
      return res.status(404).json({ error: 'Patrol not found' });
    }
    
    res.status(204).end();
  } catch (error) {
    next(error);
  }
});

// GET /patrols/nearest
router.get('/nearest', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const latitude = parseFloat(req.query.latitude as string);
    const longitude = parseFloat(req.query.longitude as string);
    
    if (isNaN(latitude) || isNaN(longitude)) {
      return res.status(400).json({ error: 'Valid latitude and longitude are required' });
    }
    
    const patrol = PatrolService.findNearestPatrol(latitude, longitude);
    
    if (!patrol) {
      return res.status(404).json({ error: 'No available patrols found' });
    }
    
    res.json(patrol);
  } catch (error) {
    next(error);
  }
});

export default router;
```

### 4. Example Controllers for Different City Services

Let's look at how controllers might be implemented for different city services:

#### Example: Fire Truck Controller

```typescript
// src/controllers/fire-truck-controller.ts
import { Router, Request, Response, NextFunction } from 'express';
import { FireTruckService } from '../services/fire-truck-service';
import { TruckType } from '../models/fire-truck';

const router = Router();

// GET /fire-trucks
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const status = req.query.status as string | undefined;
    const type = req.query.type as TruckType | undefined;
    
    if (status) {
      const trucks = FireTruckService.getTrucksByStatus(status);
      return res.json(trucks);
    }
    
    if (type) {
      const trucks = FireTruckService.getTrucksByType(type);
      return res.json(trucks);
    }
    
    const trucks = FireTruckService.getAllTrucks();
    res.json(trucks);
  } catch (error) {
    next(error);
  }
});

// GET /fire-trucks/available
router.get('/available', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const trucks = FireTruckService.getAvailableTrucks();
    res.json(trucks);
  } catch (error) {
    next(error);
  }
});

// GET /fire-trucks/for-emergency
router.get('/for-emergency', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const emergencyType = req.query.type as string;
    
    if (!emergencyType) {
      return res.status(400).json({ error: 'Emergency type is required' });
    }
    
    const trucks = FireTruckService.findTrucksForEmergency(emergencyType);
    res.json(trucks);
  } catch (error) {
    next(error);
  }
});

// GET /fire-trucks/:id
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const truck = FireTruckService.getTruckById(req.params.id);
    
    if (!truck) {
      return res.status(404).json({ error: 'Fire truck not found' });
    }
    
    res.json(truck);
  } catch (error) {
    next(error);
  }
});

// POST /fire-trucks
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const newTruck = FireTruckService.createTruck(req.body);
    res.status(201).json(newTruck);
  } catch (error) {
    next(error);
  }
});

// PUT /fire-trucks/:id/dispatch
router.put('/:id/dispatch', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { emergencyId } = req.body;
    
    if (!emergencyId) {
      return res.status(400).json({ error: 'emergencyId is required' });
    }
    
    const updatedTruck = FireTruckService.dispatchTruck(
      req.params.id,
      emergencyId
    );
    
    if (!updatedTruck) {
      return res.status(404).json({ error: 'Truck not found or unavailable' });
    }
    
    res.json(updatedTruck);
  } catch (error) {
    next(error);
  }
});

// PUT /fire-trucks/:id/complete-mission
router.put('/:id/complete-mission', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const updatedTruck = FireTruckService.completeMission(req.params.id);
    
    if (!updatedTruck) {
      return res.status(404).json({ error: 'Truck not found or not on active mission' });
    }
    
    res.json(updatedTruck);
  } catch (error) {
    next(error);
  }
});

// PUT /fire-trucks/:id/return-to-station
router.put('/:id/return-to-station', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const updatedTruck = FireTruckService.returnToStation(req.params.id);
    
    if (!updatedTruck) {
      return res.status(404).json({ error: 'Truck not found or not returning' });
    }
    
    res.json(updatedTruck);
  } catch (error) {
    next(error);
  }
});

export default router;
```

#### Example: Power Plant Controller

```typescript
// src/controllers/power-plant-controller.ts
import { Router, Request, Response, NextFunction } from 'express';
import { PowerPlantService } from '../services/power-plant-service';
import { EnergySource } from '../models/power-plant';

const router = Router();

// GET /power-plants
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const status = req.query.status as string | undefined;
    const source = req.query.source as EnergySource | undefined;
    
    if (status) {
      const plants = PowerPlantService.getPlantsByStatus(status);
      return res.json(plants);
    }
    
    if (source) {
      const plants = PowerPlantService.getPlantsBySource(source);
      return res.json(plants);
    }
    
    const plants = PowerPlantService.getAllPlants();
    res.json(plants);
  } catch (error) {
    next(error);
  }
});

// GET /power-plants/online
router.get('/online', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const plants = PowerPlantService.getOnlinePlants();
    res.json(plants);
  } catch (error) {
    next(error);
  }
});

// GET /power-plants/capacity
router.get('/capacity', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const totalCapacity = PowerPlantService.getTotalCapacity();
    const currentOutput = PowerPlantService.getCurrentOutput();
    
    res.json({
      totalCapacity,
      currentOutput,
      availableCapacity: totalCapacity - currentOutput
    });
  } catch (error) {
    next(error);
  }
});

// GET /power-plants/:id
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const plant = PowerPlantService.getPlantById(req.params.id);
    
    if (!plant) {
      return res.status(404).json({ error: 'Power plant not found' });
    }
    
    res.json(plant);
  } catch (error) {
    next(error);
  }
});

// POST /power-plants
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const newPlant = PowerPlantService.createPlant(req.body);
    res.status(201).json(newPlant);
  } catch (error) {
    next(error);
  }
});

// PUT /power-plants/:id/increase-output
router.put('/:id/increase-output', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { amount } = req.body;
    
    if (!amount || typeof amount !== 'number' || amount <= 0) {
      return res.status(400).json({ error: 'Valid positive amount is required' });
    }
    
    const updatedPlant = PowerPlantService.increaseOutput(
      req.params.id,
      amount
    );
    
    if (!updatedPlant) {
      return res.status(404).json({ error: 'Plant not found or offline' });
    }
    
    res.json(updatedPlant);
  } catch (error) {
    next(error);
  }
});

// PUT /power-plants/:id/decrease-output
router.put('/:id/decrease-output', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { amount } = req.body;
    
    if (!amount || typeof amount !== 'number' || amount <= 0) {
      return res.status(400).json({ error: 'Valid positive amount is required' });
    }
    
    const updatedPlant = PowerPlantService.decreaseOutput(
      req.params.id,
      amount
    );
    
    if (!updatedPlant) {
      return res.status(404).json({ error: 'Plant not found or offline' });
    }
    
    res.json(updatedPlant);
  } catch (error) {
    next(error);
  }
});

// GET /power-plants/:id/efficiency
router.get('/:id/efficiency', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const efficiency = PowerPlantService.calculateEfficiency(req.params.id);
    
    if (efficiency === undefined) {
      return res.status(404).json({ error: 'Plant not found' });
    }
    
    res.json({ efficiency });
  } catch (error) {
    next(error);
  }
});

// POST /power-plants/:id/schedule-maintenance
router.post('/:id/schedule-maintenance', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { startDate } = req.body;
    
    if (!startDate) {
      return res.status(400).json({ error: 'startDate is required' });
    }
    
    const date = new Date(startDate);
    
    if (isNaN(date.getTime())) {
      return res.status(400).json({ error: 'Invalid startDate format' });
    }
    
    const plant = PowerPlantService.scheduleMaintenance(
      req.params.id,
      date
    );
    
    if (!plant) {
      return res.status(404).json({ error: 'Plant not found' });
    }
    
    res.json({ success: true, message: `Maintenance scheduled for ${startDate}` });
  } catch (error) {
    next(error);
  }
});

export default router;
```

### 5. Register Controllers in Your Application

Now that you've created your controllers, you need to register them in your main application file (`src/index.ts`):

```typescript
// src/index.ts
import express from 'express';
import cors from 'cors';
import { json } from 'body-parser';
import { OpenAPIValidator } from 'express-openapi-validator';
import { join } from 'path';
import errorHandler from './middleware/error-handler';

// Import controllers
import patrolController from './controllers/patrol-controller';
// Import other controllers as needed

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

// Register routes
app.use('/patrols', patrolController);
// Register other controllers with their base paths

// Error handling middleware
app.use(errorHandler);

// Start server
app.listen(port, () => {
  console.log(`🚀 Service running at http://localhost:${port}`);
  console.log(`📚 API documentation at http://localhost:${port}/api-docs`);
});
```

### 6. Advanced Controller Patterns

As your API grows, you might want to implement more sophisticated patterns in your controllers:

#### Controller with Pagination

```typescript
// GET /resources with pagination
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = parseInt(req.query.offset as string) || 0;
    
    const result = YourResourceService.findWithPagination(limit, offset);
    
    res.json({
      data: result.data,
      total: result.total,
      limit,
      offset,
      nextOffset: offset + limit < result.total ? offset + limit : null,
      prevOffset: offset > 0 ? Math.max(0, offset - limit) : null
    });
  } catch (error) {
    next(error);
  }
});
```

#### Controller with Search

```typescript
// GET /resources/search
router.get('/search', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const query = req.query.q as string;
    
    if (!query) {
      return res.status(400).json({ error: 'Search query is required' });
    }
    
    const results = YourResourceService.search(query);
    res.json(results);
  } catch (error) {
    next(error);
  }
});
```

#### Controller with File Upload

```typescript
// POST /resources/:id/upload
router.post('/:id/upload', upload.single('file'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    const resource = YourResourceService.getById(req.params.id);
    
    if (!resource) {
      return res.status(404).json({ error: 'Resource not found' });
    }
    
    // Handle the uploaded file
    const result = YourResourceService.handleFileUpload(req.params.id, req.file);
    
    res.json(result);
  } catch (error) {
    next(error);
  }
});
```

## Testing Your Controllers

It's a good practice to test your controllers to ensure they're working as expected. You can use tools like Postman or curl to send requests to your API endpoints. Here are some basic test cases for the patrol controller:

```bash
# Get all patrols
curl http://localhost:3000/patrols

# Get available patrols
curl http://localhost:3000/patrols/available

# Get a specific patrol
curl http://localhost:3000/patrols/patrol-id

# Create a new patrol
curl -X POST http://localhost:3000/patrols \
  -H "Content-Type: application/json" \
  -d '{"type": "CAR", "location": {"latitude": 40.7128, "longitude": -74.0060}, "officerCount": 2, "status": "AVAILABLE"}'

# Update a patrol's location
curl -X PUT http://localhost:3000/patrols/patrol-id/location \
  -H "Content-Type: application/json" \
  -d '{"latitude": 40.7129, "longitude": -74.0061}'

# Assign a patrol to a call
curl -X PUT http://localhost:3000/patrols/patrol-id/assign \
  -H "Content-Type: application/json" \
  -d '{"callId": "call-id"}'

# Complete a call
curl -X PUT http://localhost:3000/patrols/patrol-id/complete

# Take a patrol out of service
curl -X PUT http://localhost:3000/patrols/patrol-id/out-of-service \
  -H "Content-Type: application/json" \
  -d '{"reason": "Maintenance"}'

# Return a patrol to service
curl -X PUT http://localhost:3000/patrols/patrol-id/return-to-service

# Find the nearest patrol to a location
curl "http://localhost:3000/patrols/nearest?latitude=40.7128&longitude=-74.0060"

# Delete a patrol
curl -X DELETE http://localhost:3000/patrols/patrol-id
```

## Next Steps

Congratulations! You've now implemented all the main components of your city service:

1. **Models**: Define the shape of your data
2. **Repositories**: Handle data access
3. **Services**: Implement business logic
4. **Controllers**: Handle HTTP requests and responses

Now, let's connect your service to the city service registry so that other services can discover and interact with it.

Head over to [Registering Your Service](./02-7-service-registry.md) 