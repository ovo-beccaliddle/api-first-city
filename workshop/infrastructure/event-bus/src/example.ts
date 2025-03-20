/**
 * Example usage of the event bus
 * This is not part of the main codebase, just for documentation
 */

import { EventBus } from './index';

async function exampleUsage() {
  // Create an event bus client
  const eventBus = new EventBus({
    // These values will be read from environment variables if not provided
    // projectId: 'city-services',
    // emulatorHost: 'localhost:8085'
  });

  // ---- PUBLISHER EXAMPLE ----

  // 1. Publishing an event
  const topicName = 'sample.resources.created';
  const data = {
    resourceId: '123',
    name: 'Example Resource',
    createdAt: new Date().toISOString(),
  };

  await eventBus.publisher.publish(topicName, data, {
    // Optional attributes
    priority: 'high',
    origin: 'sample-service',
  });

  // ---- SUBSCRIBER EXAMPLE ----

  // 2. Subscribing to an event
  const serviceName = 'notifications-service';

  await eventBus.subscriber.subscribe(
    serviceName,
    'sample.resources.created',
    async (message, data) => {
      // Process the message
      console.log('Received resource created event:', data);

      // The message is automatically acknowledged after this handler completes
      // If an error is thrown, the message will be nacked and redelivered
    }
  );

  // 3. Subscribing to multiple topics
  await eventBus.subscriber.subscribe(
    serviceName,
    'sample.resources.updated',
    async (message, data) => {
      console.log('Resource updated:', data);
    }
  );

  // 4. Unsubscribing when no longer needed
  // await eventBus.subscriber.unsubscribe(serviceName, 'sample.resources.updated');

  // 5. Close all subscriptions when shutting down
  // process.on('SIGTERM', async () => {
  //   await eventBus.close();
  //   process.exit(0);
  // });
}

// Not actually executed, just for documentation
exampleUsage().catch(console.error);
