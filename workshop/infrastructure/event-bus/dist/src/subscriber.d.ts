/**
 * Subscriber module for event bus
 * Allows services to subscribe to events from topics
 */
import { Message } from '@google-cloud/pubsub';
export interface SubscriberOptions {
    projectId?: string;
    emulatorHost?: string;
}
export type MessageHandler = (message: Message, data: any) => Promise<void> | void;
export declare class EventSubscriber {
    private pubsub;
    private subscriptions;
    private activeListeners;
    constructor(options?: SubscriberOptions);
    /**
     * Create a subscription name for a service and topic
     */
    private getSubscriptionName;
    /**
     * Subscribe to a topic with a message handler
     */
    subscribe(serviceName: string, topicName: string, handler: MessageHandler): Promise<void>;
    /**
     * Unsubscribe from a topic
     */
    unsubscribe(serviceName: string, topicName: string): Promise<void>;
    /**
     * Close all active subscriptions
     */
    closeAll(): Promise<void>;
}
