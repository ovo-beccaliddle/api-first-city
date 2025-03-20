# Registering Your Service with the City Registry

Now that you've built a fully functional city service with models, repositories, services, and controllers, it's time to make it discoverable by other city services. The City Service Registry is a central hub that allows services to discover and communicate with each other.

## What is the Service Registry?

The Service Registry is a centralized directory of all city services, containing information about:

- What services are available
- Where they're located (URLs/endpoints)
- What capabilities they provide
- Their current status and health

Think of it as a phone book for city services - when one service needs to talk to another, it first checks the registry to find out where that service is and how to talk to it.

## Why Use a Service Registry?

Using a registry provides several benefits:

- **Dynamic discovery**: Services can find each other without hardcoded URLs
- **Load balancing**: Multiple instances of the same service can register
- **Health monitoring**: The registry can track which services are operational
- **Metadata sharing**: Services can publish capabilities and version info
- **Circuit breaking**: Failing services can be automatically removed

## Connecting to the City Service Registry

Let's implement the code needed to register your service with the city registry.

### 1. Create a Registry Client

First, create a new file for the registry client in your service:

```bash
mkdir -p services/your-service-name/src/clients
touch services/your-service-name/src/clients/registry-client.ts
```

Now, implement the registry client:

```typescript
// src/clients/registry-client.ts
import axios from 'axios';
import { EventEmitter } from 'events';

// Registry service configuration
const REGISTRY_URL = process.env.REGISTRY_URL || 'http://localhost:4000';
const REGISTRY_PING_INTERVAL = 30000; // 30 seconds

// Service info
const SERVICE_INFO = {
  name: process.env.SERVICE_NAME || 'your-service-name', // Replace with your actual service name
  url: `http://localhost:${process.env.PORT || 3000}`,
  version: '1.0.0',
  description: 'Your service description here', // Update with your service description
  endpoints: [
    // List your main endpoints here
    {
      path: '/your-resources',
      methods: ['GET', 'POST'],
      description: 'Manage resources'
    },
    // Add more endpoints as needed
  ],
  status: 'ONLINE'
};

class RegistryClient extends EventEmitter {
  private pingInterval: NodeJS.Timeout | null = null;
  private isRegistered = false;

  constructor() {
    super();
  }

  async register(): Promise<boolean> {
    try {
      const response = await axios.post(`${REGISTRY_URL}/register`, SERVICE_INFO);
      
      if (response.status === 200 || response.status === 201) {
        console.log(`✅ Service registered with the city registry: ${SERVICE_INFO.name}`);
        this.isRegistered = true;
        this.startPinging();
        return true;
      } else {
        console.error(`Failed to register with the city registry: ${response.statusText}`);
        return false;
      }
    } catch (error) {
      console.error('Error registering with the city registry:', error);
      return false;
    }
  }

  async unregister(): Promise<boolean> {
    if (!this.isRegistered) return true;

    try {
      const response = await axios.post(`${REGISTRY_URL}/unregister`, {
        name: SERVICE_INFO.name,
        url: SERVICE_INFO.url
      });
      
      if (response.status === 200) {
        console.log(`✅ Service unregistered from the city registry: ${SERVICE_INFO.name}`);
        this.isRegistered = false;
        this.stopPinging();
        return true;
      } else {
        console.error(`Failed to unregister from the city registry: ${response.statusText}`);
        return false;
      }
    } catch (error) {
      console.error('Error unregistering from the city registry:', error);
      return false;
    }
  }

  async getServices(): Promise<any[]> {
    try {
      const response = await axios.get(`${REGISTRY_URL}/services`);
      return response.data;
    } catch (error) {
      console.error('Error fetching services from the registry:', error);
      return [];
    }
  }

  async getServiceByName(name: string): Promise<any | null> {
    try {
      const response = await axios.get(`${REGISTRY_URL}/services/${name}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching service "${name}" from the registry:`, error);
      return null;
    }
  }

  private startPinging(): void {
    if (this.pingInterval) return;

    this.pingInterval = setInterval(async () => {
      try {
        await axios.post(`${REGISTRY_URL}/ping`, {
          name: SERVICE_INFO.name,
          status: 'ONLINE'
        });
      } catch (error) {
        console.error('Error pinging the city registry:', error);
        this.emit('registry-connection-lost');
      }
    }, REGISTRY_PING_INTERVAL);
  }

  private stopPinging(): void {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }
}

// Create and export a singleton instance
export const registryClient = new RegistryClient();

// Ensure the service unregisters when the application is shutting down
process.on('SIGINT', async () => {
  console.log('Service shutting down, unregistering from registry...');
  await registryClient.unregister();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('Service shutting down, unregistering from registry...');
  await registryClient.unregister();
  process.exit(0);
});
```

### 2. Update Your Service Information

Edit the `SERVICE_INFO` object in the client to accurately reflect your service:

```typescript
// Example for a Police Service
const SERVICE_INFO = {
  name: process.env.SERVICE_NAME || 'police-service',
  url: `http://localhost:${process.env.PORT || 3000}`,
  version: '1.0.0',
  description: 'Police department service providing patrol management and emergency response',
  endpoints: [
    {
      path: '/patrols',
      methods: ['GET', 'POST'],
      description: 'Manage police patrols'
    },
    {
      path: '/patrols/available',
      methods: ['GET'],
      description: 'Get available patrols'
    },
    {
      path: '/patrols/nearest',
      methods: ['GET'],
      description: 'Find nearest patrol to a location'
    },
    {
      path: '/calls',
      methods: ['GET', 'POST', 'PUT'],
      description: 'Manage emergency calls'
    }
  ],
  status: 'ONLINE'
};
```

### 3. Register Your Service on Startup

Update your main application file (`src/index.ts`) to register with the registry when the service starts:

```typescript
// src/index.ts
import express from 'express';
import cors from 'cors';
import { json } from 'body-parser';
import { OpenAPIValidator } from 'express-openapi-validator';
import { join } from 'path';
import errorHandler from './middleware/error-handler';
import { registryClient } from './clients/registry-client';

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

// Add a simple health check endpoint for the registry
app.get('/health', (req, res) => {
  res.json({ status: 'UP', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use(errorHandler);

// Start server
app.listen(port, async () => {
  console.log(`🚀 Service running at http://localhost:${port}`);
  console.log(`📚 API documentation at http://localhost:${port}/api-docs`);
  
  // Register with the city service registry
  const registered = await registryClient.register();
  if (registered) {
    console.log('Service successfully registered with the city registry');
  } else {
    console.warn('Failed to register with the city registry. Other services may not be able to discover this service.');
  }
});
```

### 4. Creating a Service Discovery Utility

To make it easier to discover and communicate with other services, let's create a utility function:

```bash
touch services/your-service-name/src/utils/service-discovery.ts
```

Implement the service discovery utility:

```typescript
// src/utils/service-discovery.ts
import axios from 'axios';
import { registryClient } from '../clients/registry-client';

export interface ServiceInfo {
  name: string;
  url: string;
  version: string;
  description: string;
  endpoints: {
    path: string;
    methods: string[];
    description: string;
  }[];
  status: string;
}

export class ServiceDiscovery {
  /**
   * Find a service by name
   */
  static async findService(name: string): Promise<ServiceInfo | null> {
    return await registryClient.getServiceByName(name);
  }
  
  /**
   * Get all available services
   */
  static async getAllServices(): Promise<ServiceInfo[]> {
    return await registryClient.getServices();
  }
  
  /**
   * Call another service's API
   */
  static async callService<T = any>(
    serviceName: string, 
    endpoint: string, 
    method: 'get' | 'post' | 'put' | 'delete' = 'get',
    data?: any
  ): Promise<T | null> {
    try {
      const service = await this.findService(serviceName);
      
      if (!service || service.status !== 'ONLINE') {
        console.error(`Service ${serviceName} not found or not available`);
        return null;
      }
      
      const url = `${service.url}${endpoint}`;
      
      let response;
      switch (method) {
        case 'get':
          response = await axios.get(url);
          break;
        case 'post':
          response = await axios.post(url, data);
          break;
        case 'put':
          response = await axios.put(url, data);
          break;
        case 'delete':
          response = await axios.delete(url);
          break;
      }
      
      return response.data;
    } catch (error) {
      console.error(`Error calling service ${serviceName}:`, error);
      return null;
    }
  }
}
```

## Using the Service Registry

Now that your service is registered with the city registry, let's see how you can use it to discover and communicate with other services.

### Example: Finding and Calling Another Service

Here's how you might use the service discovery utility in your code:

```typescript
// src/services/patrol-service.ts
import { ServiceDiscovery } from '../utils/service-discovery';

export const PatrolService = {
  // ... other methods
  
  // Assign a patrol to a call and also notify the dispatch service
  async assignToCall(patrolId: string, callId: string): Promise<Patrol | undefined> {
    const patrol = PatrolRepository.findById(patrolId);
    
    if (!patrol || patrol.status !== PatrolStatus.AVAILABLE) {
      return undefined;
    }
    
    // Update the patrol in our local repository
    const updatedPatrol = PatrolRepository.update(patrolId, {
      activeCall: callId,
      status: PatrolStatus.BUSY
    });
    
    if (updatedPatrol) {
      // Notify the dispatch service about the assignment
      await ServiceDiscovery.callService(
        'dispatch-service',
        '/dispatch/assignments',
        'post',
        {
          patrolId,
          callId,
          timestamp: new Date().toISOString(),
          estimatedArrivalTime: calculateETA(patrol.location, callLocation)
        }
      );
    }
    
    return updatedPatrol;
  }
};
```

### Example: Looking Up Multiple Services

```typescript
// src/services/emergency-service.ts
import { ServiceDiscovery } from '../utils/service-discovery';

export const EmergencyService = {
  // Coordinate a response to a major incident by finding all relevant services
  async coordinateMajorIncident(incident: MajorIncident): Promise<boolean> {
    try {
      // Get all city services
      const allServices = await ServiceDiscovery.getAllServices();
      
      // Find the services we need for this incident
      const policeService = allServices.find(s => s.name === 'police-service');
      const fireService = allServices.find(s => s.name === 'fire-service');
      const ambulanceService = allServices.find(s => s.name === 'ambulance-service');
      const trafficService = allServices.find(s => s.name === 'traffic-service');
      
      // Ensure all required services are available
      if (!policeService || !fireService || !ambulanceService) {
        console.error('Cannot coordinate response: Required services unavailable');
        return false;
      }
      
      // Dispatch required resources from each service
      await Promise.all([
        ServiceDiscovery.callService(
          'police-service',
          '/patrols/dispatch-multiple',
          'post',
          {
            location: incident.location,
            requiredUnits: incident.requiredPoliceUnits,
            incidentId: incident.id
          }
        ),
        ServiceDiscovery.callService(
          'fire-service',
          '/trucks/dispatch-multiple',
          'post',
          {
            location: incident.location,
            requiredUnits: incident.requiredFireUnits,
            incidentId: incident.id
          }
        ),
        ServiceDiscovery.callService(
          'ambulance-service',
          '/ambulances/dispatch-multiple',
          'post',
          {
            location: incident.location,
            requiredUnits: incident.requiredAmbulances,
            incidentId: incident.id
          }
        )
      ]);
      
      // If traffic service is available, optimize traffic signals
      if (trafficService) {
        await ServiceDiscovery.callService(
          'traffic-service',
          '/traffic-signals/emergency-route',
          'post',
          {
            destination: incident.location,
            priority: 'HIGH',
            incidentId: incident.id
          }
        );
      }
      
      return true;
    } catch (error) {
      console.error('Error coordinating major incident response:', error);
      return false;
    }
  }
};
```

## Testing the Registry Integration

To test if your service successfully registers with the city registry:

1. Start the city registry service first:

```bash
cd city-registry
npm install
npm start
```

2. Start your service:

```bash
cd services/your-service-name
npm install
npm start
```

3. Check if your service appears in the registry:

```bash
curl http://localhost:4000/services
```

4. You should see your service listed in the response with its details.

## Next Steps

Congratulations! Your service is now implemented and integrated with the city service registry. This means other services can discover it and communicate with it.

In the next exercise, we'll explore how to implement more advanced communication patterns between services, such as event-based communication, circuit breakers, and more.

Head over to [Testing Your Implementation](./02-8-testing.md) 