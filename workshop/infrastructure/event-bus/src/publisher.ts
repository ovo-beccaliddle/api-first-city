/**
 * Publisher module for event bus
 * Allows services to publish events to topics
 */

import { PubSub, Topic } from '@google-cloud/pubsub';

export interface PublisherOptions {
  projectId?: string;
  emulatorHost?: string;
}

export class EventPublisher {
  private pubsub: PubSub;
  private topics: Map<string, Topic> = new Map();

  constructor(options: PublisherOptions = {}) {
    this.pubsub = new PubSub({
      projectId: options.projectId || process.env.PUBSUB_PROJECT_ID || 'city-services',
      apiEndpoint: options.emulatorHost || process.env.PUBSUB_EMULATOR_HOST,
    });
  }

  /**
   * Get or create a topic instance
   */
  private getTopic(topicName: string): Topic {
    if (!this.topics.has(topicName)) {
      this.topics.set(topicName, this.pubsub.topic(topicName));
    }
    return this.topics.get(topicName)!;
  }

  /**
   * Publish an event to a topic
   * @param topicName The name of the topic to publish to
   * @param data The data to publish
   * @param attributes Optional message attributes
   * @returns The message ID
   */
  async publish(
    topicName: string,
    data: any,
    attributes: Record<string, string> = {}
  ): Promise<string> {
    try {
      // Prepare the data - must be a Buffer for Pub/Sub
      const dataBuffer = Buffer.from(JSON.stringify(data));

      // Add standard attributes
      const enrichedAttributes = {
        ...attributes,
        timestamp: new Date().toISOString(),
        eventType: topicName,
      };

      // Get the topic and publish
      const topic = this.getTopic(topicName);
      const messageId = await topic.publish(dataBuffer, enrichedAttributes);

      console.log(`Published message ${messageId} to topic ${topicName}`);
      return messageId;
    } catch (error) {
      console.error(`Error publishing to topic ${topicName}:`, error);
      throw error;
    }
  }

  /**
   * Check if a topic exists
   */
  async topicExists(topicName: string): Promise<boolean> {
    try {
      const topic = this.getTopic(topicName);
      const [exists] = await topic.exists();
      return exists;
    } catch (error) {
      console.error(`Error checking if topic ${topicName} exists:`, error);
      return false;
    }
  }
}
