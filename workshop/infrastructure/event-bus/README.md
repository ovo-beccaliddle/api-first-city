# City Services Event Bus

This module provides event bus functionality for the city services architecture using Google Cloud Pub/Sub.

## Local Development

For local development, a Pub/Sub emulator is provided via Docker Compose. This allows you to develop and test event-based interactions without needing a real Google Cloud project.

### Starting the Emulator

Start the Pub/Sub emulator using the included Docker Compose file:

```bash
cd workshop/infrastructure/event-bus
docker-compose up -d
```

This will start:

1. The Google Cloud Pub/Sub emulator on port 8085
2. A setup container that creates the default topics

### Using in Services

To use the event bus in your services, you need to set the following environment variables:

```
PUBSUB_EMULATOR_HOST=localhost:8085
PUBSUB_PROJECT_ID=city-services
```

In Docker Compose, these are automatically set for services that need to interact with the event bus.

## API Usage

### Publishing Events

```typescript
import { EventBus } from '@city-services/event-bus';

// Create an event bus client
const eventBus = new EventBus();

// Publish an event
await eventBus.publisher.publish(
  'sample.resources.created',
  {
    resourceId: '123',
    name: 'Example Resource',
    createdAt: new Date().toISOString(),
  },
  {
    // Optional attributes
    priority: 'high',
    origin: 'sample-service',
  }
);
```

### Subscribing to Events

```typescript
import { EventBus } from '@city-services/event-bus';

// Create an event bus client
const eventBus = new EventBus();

// Subscribe to an event
await eventBus.subscriber.subscribe(
  'my-service-name',
  'sample.resources.created',
  async (message, data) => {
    // Process the message
    console.log('Resource created:', data);

    // The message is automatically acknowledged after this handler completes
    // If an error is thrown, the message will be nacked and redelivered
  }
);

// Close subscriptions on shutdown
process.on('SIGTERM', async () => {
  await eventBus.close();
  process.exit(0);
});
```

## Event Topics

The following standard topics are created automatically:

### Emergency Services

- `emergency.incidents.reported`
- `emergency.incidents.updated`
- `emergency.incidents.resolved`

### Utility Services

- `utilities.outages.reported`
- `utilities.maintenance.scheduled`

### Transportation Services

- `transportation.traffic.congestion`
- `transportation.public-transit.delays`

### Citizen Services

- `citizen.requests.submitted`
- `citizen.permits.approved`

### Sample Service

- `sample.resources.created`
- `sample.resources.updated`
- `sample.resources.deleted`
