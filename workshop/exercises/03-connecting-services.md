---
layout: layout.njk
---

# Exercise 3: Connecting City Services Together

Awesome work, city developer! 🏙️ 

Your service is up and running, but a city isn't made of isolated services—it's a living ecosystem where everything needs to work together. In this exercise, we'll connect your service to others and implement more advanced integration patterns.

## What You'll Learn

By the end of this exercise, you'll be able to:

1. Discover and communicate with other city services
2. Implement both synchronous and asynchronous integration patterns
3. Publish and subscribe to events using the city event bus
4. Handle cross-service authentication and authorization
5. Implement resilient communication with timeouts and retries

## Why Service Integration Matters

In our city metaphor:
- The ambulance service needs to know where hospitals are located
- The power plant needs to report usage to financial services
- Traffic cameras need to communicate violations to the fines system

These cross-service interactions make our city "smart" and reflect real-world dependencies.

## Let's Start Connecting!

### 1. Exploring the Service Registry

The city provides a central service registry for service discovery:

1. Check out the registry's API at `http://localhost:8080/api-docs`
2. See what services are currently registered:
   ```bash
   curl http://localhost:8080/registry
   ```

You should see your service and others that your teammates have registered. This is how services can find each other!

### 2. Calling Other Services

Now, let's call another service from yours. Choose a service that makes sense for your domain:

- Police service could call Dispatch service
- Ambulance could call Hospital service
- Traffic cameras could call Fines service

Here's how to add client code to call another service:

```typescript
// src/clients/dispatch-client.ts
import axios from 'axios';
import { ServiceRegistry } from '../utils/service-registry';

// Define types for the external service
interface Call {
  id: string;
  type: string;
  location: {
    latitude: number;
    longitude: number;
  };
  status: 'PENDING' | 'ASSIGNED' | 'RESOLVED';
  description: string;
}

export class DispatchClient {
  private baseUrl: string | null = null;

  constructor(private registry: ServiceRegistry) {}

  // Lazy initialization of the service URL
  private async getBaseUrl(): Promise<string> {
    if (!this.baseUrl) {
      const service = await this.registry.getService('dispatch-service');
      if (!service) {
        throw new Error('Dispatch service not found in registry');
      }
      this.baseUrl = service.url;
    }
    return this.baseUrl;
  }

  // Get all active calls
  async getActiveCalls(): Promise<Call[]> {
    const url = `${await this.getBaseUrl()}/calls?status=PENDING`;
    const response = await axios.get(url);
    return response.data;
  }

  // Get a specific call
  async getCall(callId: string): Promise<Call> {
    const url = `${await this.getBaseUrl()}/calls/${callId}`;
    const response = await axios.get(url);
    return response.data;
  }

  // Assign a patrol to a call
  async assignPatrolToCall(callId: string, patrolId: string): Promise<Call> {
    const url = `${await this.getBaseUrl()}/calls/${callId}/assign`;
    const response = await axios.put(url, { patrolId });
    return response.data;
  }
}
```

Next, create a service registry utility to discover services:

```typescript
// src/utils/service-registry.ts
import axios from 'axios';

interface Service {
  serviceName: string;
  url: string;
  endpoints: {
    path: string;
    methods: string[];
  }[];
}

export class ServiceRegistry {
  private registryUrl: string;
  private serviceCache: Map<string, Service> = new Map();
  private cacheExpiration: Map<string, number> = new Map();
  private cacheTtlMs = 60000; // 1 minute cache

  constructor(registryUrl = 'http://localhost:8080/registry') {
    this.registryUrl = registryUrl;
  }

  async getService(serviceName: string): Promise<Service | null> {
    // Check cache first
    if (this.serviceCache.has(serviceName)) {
      const expiration = this.cacheExpiration.get(serviceName) || 0;
      if (Date.now() < expiration) {
        return this.serviceCache.get(serviceName) || null;
      }
    }

    // Cache miss or expired, get from registry
    try {
      const response = await axios.get(`${this.registryUrl}/${serviceName}`);
      const service = response.data;
      
      // Update cache
      this.serviceCache.set(serviceName, service);
      this.cacheExpiration.set(serviceName, Date.now() + this.cacheTtlMs);
      
      return service;
    } catch (error) {
      console.error(`Failed to get service ${serviceName}:`, error);
      return null;
    }
  }

  async getAllServices(): Promise<Service[]> {
    try {
      const response = await axios.get(this.registryUrl);
      return response.data;
    } catch (error) {
      console.error('Failed to get all services:', error);
      return [];
    }
  }
}
```

### 3. Update Your Service to Use the Client

Now integrate the client into your service:

```typescript
// Update your services/patrol-service.ts
import { Patrol, PatrolType } from '../models/patrol';
import { PatrolRepository } from '../repositories/patrol-repository';
import { DispatchClient } from '../clients/dispatch-client';
import { ServiceRegistry } from '../utils/service-registry';

// Create registry and client instances
const registry = new ServiceRegistry();
const dispatchClient = new DispatchClient(registry);

export const PatrolService = {
  // ... existing methods
  
  // New method to get available calls from dispatch
  getAvailableCalls: async (): Promise<any[]> => {
    try {
      return await dispatchClient.getActiveCalls();
    } catch (error) {
      console.error('Error getting active calls:', error);
      return [];
    }
  },
  
  // Enhanced method to assign to call - now communicates with dispatch
  assignToCall: async (patrolId: string, callId: string): Promise<Patrol | undefined> => {
    const patrol = PatrolRepository.findById(patrolId);
    
    if (!patrol || patrol.status !== 'AVAILABLE') {
      return undefined;
    }
    
    try {
      // Update the call in dispatch service
      await dispatchClient.assignPatrolToCall(callId, patrolId);
      
      // Update local patrol
      return PatrolRepository.update(patrolId, {
        activeCall: callId,
        status: 'BUSY'
      });
    } catch (error) {
      console.error('Error assigning patrol to call:', error);
      return undefined;
    }
  }
};
```

### 4. Implement Event-Based Communication (Pub/Sub)

For some integrations, synchronous REST calls aren't ideal. Let's implement pub/sub for events:

First, create an event publisher:

```typescript
// src/utils/event-publisher.ts
import axios from 'axios';

export interface Event<T> {
  eventType: string;
  timestamp: string;
  source: string;
  data: T;
}

export class EventPublisher {
  private eventBusUrl: string;
  
  constructor(eventBusUrl = 'http://localhost:8081/events') {
    this.eventBusUrl = eventBusUrl;
  }
  
  async publish<T>(eventType: string, data: T): Promise<void> {
    const event: Event<T> = {
      eventType,
      timestamp: new Date().toISOString(),
      source: 'police-service', // use your service name
      data
    };
    
    try {
      await axios.post(this.eventBusUrl, event);
      console.log(`Published event: ${eventType}`);
    } catch (error) {
      console.error(`Failed to publish event ${eventType}:`, error);
      throw error;
    }
  }
}
```

Now use it in your service to publish events:

```typescript
// Update services/patrol-service.ts
import { EventPublisher } from '../utils/event-publisher';

const eventPublisher = new EventPublisher();

export const PatrolService = {
  // ... existing methods
  
  completeCall: async (patrolId: string): Promise<Patrol | undefined> => {
    const patrol = PatrolRepository.findById(patrolId);
    
    if (!patrol || !patrol.activeCall) {
      return undefined;
    }
    
    const updatedPatrol = PatrolRepository.update(patrolId, {
      activeCall: undefined,
      status: 'AVAILABLE'
    });
    
    if (updatedPatrol) {
      // Publish an event that others can subscribe to
      await eventPublisher.publish('patrol.available', {
        patrolId: updatedPatrol.id,
        patrolType: updatedPatrol.type,
        location: updatedPatrol.location
      });
    }
    
    return updatedPatrol;
  }
};
```

### 5. Subscribing to Events

To listen for events from other services, create an event subscriber:

```typescript
// src/utils/event-subscriber.ts
import express from 'express';

interface EventHandler<T> {
  (data: T): Promise<void>;
}

export class EventSubscriber {
  private handlers: Map<string, EventHandler<any>[]> = new Map();
  
  constructor(private app: express.Application) {
    // Set up the webhook endpoint for events
    this.app.post('/events/webhook', express.json(), this.handleEvent.bind(this));
  }
  
  subscribe<T>(eventType: string, handler: EventHandler<T>): void {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, []);
    }
    this.handlers.get(eventType)?.push(handler);
    console.log(`Subscribed to event: ${eventType}`);
  }
  
  private async handleEvent(req: express.Request, res: express.Response): Promise<void> {
    const event = req.body;
    
    if (!event || !event.eventType) {
      res.status(400).json({ error: 'Invalid event format' });
      return;
    }
    
    console.log(`Received event: ${event.eventType}`);
    
    const handlers = this.handlers.get(event.eventType) || [];
    
    try {
      await Promise.all(handlers.map(handler => handler(event.data)));
      res.status(200).json({ success: true });
    } catch (error) {
      console.error(`Error handling event ${event.eventType}:`, error);
      res.status(500).json({ error: 'Error handling event' });
    }
  }
}
```

Register your event subscriptions in your main application:

```typescript
// Update src/index.ts
import { EventSubscriber } from './utils/event-subscriber';
import { PatrolService } from './services/patrol-service';

// Create event subscriber
const eventSubscriber = new EventSubscriber(app);

// Subscribe to relevant events
eventSubscriber.subscribe('emergency.reported', async (data) => {
  console.log('Emergency reported:', data);
  // Maybe automatically assign closest patrol?
  const closestPatrol = await PatrolService.findClosestPatrolToLocation(data.location);
  if (closestPatrol) {
    await PatrolService.assignToCall(closestPatrol.id, data.emergencyId);
  }
});

// Register your event subscriptions with the event bus
async function registerEventSubscriptions() {
  try {
    await axios.post('http://localhost:8081/subscriptions', {
      serviceName: 'police-service',
      url: `http://localhost:${port}/events/webhook`,
      events: ['emergency.reported']
    });
    console.log('✅ Registered event subscriptions');
  } catch (error) {
    console.error('❌ Failed to register event subscriptions:', error);
  }
}

// Call this after app starts
app.listen(port, () => {
  console.log(`🚀 Service running at http://localhost:${port}`);
  registerService();
  registerEventSubscriptions();
});
```

### 6. Implementing Resilient Communication

When services depend on each other, we need to handle failures gracefully:

```typescript
// src/utils/resilient-client.ts
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';

interface RetryConfig {
  maxRetries: number;
  retryDelay: number;
  timeoutMs: number;
}

export class ResilientClient {
  private config: RetryConfig;
  
  constructor(config?: Partial<RetryConfig>) {
    this.config = {
      maxRetries: 3,
      retryDelay: 300,
      timeoutMs: 5000,
      ...config
    };
  }
  
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>(() => axios.get(url, {
      ...config,
      timeout: this.config.timeoutMs
    }));
  }
  
  async post<T>(url: string, data: any, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>(() => axios.post(url, data, {
      ...config,
      timeout: this.config.timeoutMs
    }));
  }
  
  async put<T>(url: string, data: any, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>(() => axios.put(url, data, {
      ...config,
      timeout: this.config.timeoutMs
    }));
  }
  
  private async request<T>(fn: () => Promise<AxiosResponse<T>>): Promise<T> {
    let lastError: Error | null = null;
    
    for (let retry = 0; retry <= this.config.maxRetries; retry++) {
      try {
        const response = await fn();
        return response.data;
      } catch (error: any) {
        lastError = error;
        
        // Don't retry on 4xx client errors (except 408 Request Timeout)
        if (error.response && error.response.status >= 400 && error.response.status < 500 && error.response.status !== 408) {
          break;
        }
        
        if (retry < this.config.maxRetries) {
          // Wait before retrying
          await new Promise(resolve => setTimeout(resolve, this.config.retryDelay * (retry + 1)));
          console.log(`Retrying request (${retry + 1}/${this.config.maxRetries})...`);
        }
      }
    }
    
    throw lastError;
  }
}
```

Use the resilient client in your service clients:

```typescript
// Update clients/dispatch-client.ts
import { ResilientClient } from '../utils/resilient-client';

export class DispatchClient {
  private baseUrl: string | null = null;
  private client: ResilientClient;

  constructor(private registry: ServiceRegistry) {
    this.client = new ResilientClient();
  }
  
  // ...existing methods using this.client.get instead of axios.get
}
```

### 7. Testing the Integration

Let's make sure everything works:

1. Start your service and any services you're integrating with:
   ```bash
   # In your service directory
   npm run dev
   
   # In other service directories
   cd ../other-service
   npm run dev
   ```

2. Test the integrations:
   ```bash
   # If your service is Police, test getting calls from Dispatch
   curl http://localhost:3000/calls/available
   
   # Test assigning a patrol to a call
   curl -X PUT http://localhost:3000/patrols/patrol-id/assign \
     -H "Content-Type: application/json" \
     -d '{"callId": "call-id"}'
   ```

3. Test the event system:
   ```bash
   # Trigger an event
   curl -X POST http://localhost:8081/events \
     -H "Content-Type: application/json" \
     -d '{
       "eventType": "emergency.reported",
       "timestamp": "2023-06-30T12:34:56Z",
       "source": "dispatch-service",
       "data": {
         "emergencyId": "e12345",
         "type": "FIRE",
         "location": {
           "latitude": 40.7128,
           "longitude": -74.0060
         }
       }
     }'
   ```

## Bonus Challenges

If you're speeding ahead:

1. Implement circuit breaking for service calls to prevent cascading failures
2. Add caching for frequently-requested data from other services
3. Create a dashboard that shows the state of your service and its integrations
4. Implement more complex cross-service scenarios from the service description
5. Add metrics to track service call performance and reliability

## Helpful Resources

- [Axios Documentation](https://axios-http.com/docs/intro)
- [Pub/Sub Pattern](https://cloud.google.com/pubsub/docs/overview)
- [Circuit Breaker Pattern](https://martinfowler.com/bliki/CircuitBreaker.html)