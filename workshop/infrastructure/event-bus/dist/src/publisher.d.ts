/**
 * Publisher module for event bus
 * Allows services to publish events to topics
 */
export interface PublisherOptions {
    projectId?: string;
    emulatorHost?: string;
}
export declare class EventPublisher {
    private pubsub;
    private topics;
    constructor(options?: PublisherOptions);
    /**
     * Get or create a topic instance
     */
    private getTopic;
    /**
     * Publish an event to a topic
     * @param topicName The name of the topic to publish to
     * @param data The data to publish
     * @param attributes Optional message attributes
     * @returns The message ID
     */
    publish(topicName: string, data: any, attributes?: Record<string, string>): Promise<string>;
    /**
     * Check if a topic exists
     */
    topicExists(topicName: string): Promise<boolean>;
}
