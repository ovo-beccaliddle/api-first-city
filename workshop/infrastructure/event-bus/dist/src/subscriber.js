"use strict";
/**
 * Subscriber module for event bus
 * Allows services to subscribe to events from topics
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventSubscriber = void 0;
const pubsub_1 = require("@google-cloud/pubsub");
class EventSubscriber {
    constructor(options = {}) {
        this.subscriptions = new Map();
        this.activeListeners = new Set();
        this.pubsub = new pubsub_1.PubSub({
            projectId: options.projectId || process.env.PUBSUB_PROJECT_ID || 'city-services',
            apiEndpoint: options.emulatorHost || process.env.PUBSUB_EMULATOR_HOST,
        });
    }
    /**
     * Create a subscription name for a service and topic
     */
    getSubscriptionName(serviceName, topicName) {
        return `${serviceName}-${topicName.replace(/\./g, '-')}`;
    }
    /**
     * Subscribe to a topic with a message handler
     */
    async subscribe(serviceName, topicName, handler) {
        const subscriptionName = this.getSubscriptionName(serviceName, topicName);
        const subscriptionKey = `${serviceName}:${topicName}`;
        // Don't set up the same subscription twice
        if (this.activeListeners.has(subscriptionKey)) {
            console.log(`Subscription ${subscriptionName} is already active`);
            return;
        }
        try {
            // Create topic if it doesn't exist
            const topic = this.pubsub.topic(topicName);
            const [topicExists] = await topic.exists();
            if (!topicExists) {
                console.log(`Topic ${topicName} doesn't exist, creating it...`);
                await this.pubsub.createTopic(topicName);
            }
            // Get or create the subscription
            const [subscription] = await topic.createSubscription(subscriptionName, {
            // In production, you would configure other options here like:
            // - expirationPolicy
            // - retryPolicy
            // - filter
            // For emulator simplicity, we're using defaults
            });
            // Store the subscription
            this.subscriptions.set(subscriptionKey, subscription);
            // Set up the message handler
            subscription.on('message', async (message) => {
                try {
                    // Parse the message data
                    const data = JSON.parse(message.data.toString());
                    // Process the message
                    await handler(message, data);
                    // Acknowledge the message to remove it from the queue
                    message.ack();
                }
                catch (error) {
                    console.error(`Error processing message from ${topicName}:`, error);
                    // Nack the message to requeue it if there's a processing error
                    message.nack();
                }
            });
            subscription.on('error', (error) => {
                console.error(`Subscription ${subscriptionName} error:`, error);
            });
            this.activeListeners.add(subscriptionKey);
            console.log(`Subscribed to ${topicName} as ${subscriptionName}`);
        }
        catch (error) {
            console.error(`Error subscribing to ${topicName}:`, error);
            throw error;
        }
    }
    /**
     * Unsubscribe from a topic
     */
    async unsubscribe(serviceName, topicName) {
        const subscriptionKey = `${serviceName}:${topicName}`;
        const subscription = this.subscriptions.get(subscriptionKey);
        if (!subscription) {
            console.log(`No active subscription for ${serviceName} to ${topicName}`);
            return;
        }
        try {
            // Stop receiving messages
            await subscription.close();
            this.subscriptions.delete(subscriptionKey);
            this.activeListeners.delete(subscriptionKey);
            console.log(`Unsubscribed from ${topicName}`);
        }
        catch (error) {
            console.error(`Error unsubscribing from ${topicName}:`, error);
            throw error;
        }
    }
    /**
     * Close all active subscriptions
     */
    async closeAll() {
        const closePromises = Array.from(this.subscriptions.values()).map((subscription) => subscription.close());
        try {
            await Promise.all(closePromises);
            this.subscriptions.clear();
            this.activeListeners.clear();
            console.log('All subscriptions closed');
        }
        catch (error) {
            console.error('Error closing subscriptions:', error);
            throw error;
        }
    }
}
exports.EventSubscriber = EventSubscriber;
//# sourceMappingURL=subscriber.js.map