/**
 * Event Bus module exports
 */
export { setupEventBus } from './setup';
export { EventPublisher } from './publisher';
export { EventSubscriber, type MessageHandler } from './subscriber';
import { EventPublisher } from './publisher';
import { EventSubscriber } from './subscriber';
export interface EventBusOptions {
    projectId?: string;
    emulatorHost?: string;
}
/**
 * Combined EventBus client for publishing and subscribing
 */
export declare class EventBus {
    publisher: EventPublisher;
    subscriber: EventSubscriber;
    constructor(options?: EventBusOptions);
    /**
     * Close all subscriptions when shutting down
     */
    close(): Promise<void>;
}
