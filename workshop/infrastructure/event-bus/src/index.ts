/**
 * Event Bus module exports
 */

export { setupEventBus } from './setup';
export { EventPublisher } from './publisher';
export { EventSubscriber, type MessageHandler } from './subscriber';

// Main client for ease of use
import { EventPublisher } from './publisher';
import { EventSubscriber } from './subscriber';

export interface EventBusOptions {
  projectId?: string;
  emulatorHost?: string;
}

/**
 * Combined EventBus client for publishing and subscribing
 */
export class EventBus {
  public publisher: EventPublisher;
  public subscriber: EventSubscriber;

  constructor(options: EventBusOptions = {}) {
    this.publisher = new EventPublisher(options);
    this.subscriber = new EventSubscriber(options);
  }

  /**
   * Close all subscriptions when shutting down
   */
  async close(): Promise<void> {
    await this.subscriber.closeAll();
  }
}
