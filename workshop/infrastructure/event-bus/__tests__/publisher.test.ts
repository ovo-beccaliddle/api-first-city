import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PubSub } from '@google-cloud/pubsub';
import { EventPublisher } from '../src/publisher';

// Mock PubSub class - must be outside of any lifecycle methods
vi.mock('@google-cloud/pubsub', () => {
  // Define the mock topic inside the mock factory
  const mockTopic = {
    name: 'test-topic',
    exists: vi.fn().mockResolvedValue([true]),
    publish: vi.fn().mockResolvedValue('message-id'),
  };

  return {
    PubSub: vi.fn().mockImplementation(() => {
      const topicFn = vi.fn().mockReturnValue(mockTopic);
      return {
        topic: topicFn,
        createTopic: vi.fn().mockResolvedValue([mockTopic]),
      };
    }),
  };
});

describe('EventPublisher', () => {
  let publisher: EventPublisher;
  let mockPubSub: any;
  let mockTopic: any;

  beforeEach(() => {
    // Clear all mocks
    vi.clearAllMocks();

    // Get fresh instances
    mockPubSub = new PubSub();
    mockTopic = mockPubSub.topic();

    // Create a new publisher
    publisher = new EventPublisher({
      projectId: 'test-project',
      emulatorHost: 'localhost:8085',
    });
  });

  describe('constructor', () => {
    it('should create a PubSub client with options', () => {
      expect(PubSub).toHaveBeenCalledWith({
        projectId: 'test-project',
        apiEndpoint: 'localhost:8085',
      });
    });

    it('should create a PubSub client with default options', () => {
      // Clear the previous calls
      vi.clearAllMocks();

      new EventPublisher();

      // Check the last call to PubSub had empty options
      const pubSubCalls = (PubSub as any).mock.calls;
      expect(pubSubCalls[pubSubCalls.length - 1][0]).toEqual({
        projectId: 'city-services',
        apiEndpoint: undefined,
      });
    });
  });

  describe('publish', () => {
    it('should publish a message to a topic', async () => {
      // Override topic method to track calls
      const topicName = 'test-topic';
      mockPubSub.topic.mockImplementation((name: string) => {
        expect(name).toBe(topicName);
        return mockTopic;
      });

      // Set up test data
      const data = { test: 'data' };
      const attributes = { priority: 'high' };

      // Call publish
      const messageId = await publisher.publish(topicName, data, attributes);

      // Verify publish was called
      expect(mockTopic.publish).toHaveBeenCalled();

      // Get the publish call arguments
      const publishArgs = mockTopic.publish.mock.calls[0];

      // Check that data was converted to a buffer
      expect(publishArgs[0]).toBeInstanceOf(Buffer);
      expect(JSON.parse(publishArgs[0].toString())).toEqual(data);

      // Check that attributes were expanded with timestamp and eventType
      expect(publishArgs[1]).toMatchObject({
        ...attributes,
        eventType: topicName,
      });
      expect(publishArgs[1].timestamp).toBeDefined();

      // Verify the message ID was returned
      expect(messageId).toBe('message-id');
    });

    it('should publish a message with default empty attributes', async () => {
      // Set up test data
      const topicName = 'test-topic';
      const data = { test: 'data' };

      // Call publish without attributes
      await publisher.publish(topicName, data);

      // Verify publish was called
      expect(mockTopic.publish).toHaveBeenCalled();

      // Get the publish call arguments
      const publishArgs = mockTopic.publish.mock.calls[0];

      // Check attributes have default values
      expect(publishArgs[1]).toMatchObject({
        eventType: topicName,
      });
      expect(publishArgs[1].timestamp).toBeDefined();
    });

    it('should handle publish errors', async () => {
      // Mock publish to throw
      mockTopic.publish.mockRejectedValueOnce(new Error('Publish error'));

      // Set up test data
      const topicName = 'test-topic';
      const data = { test: 'data' };

      // Publish should throw
      await expect(publisher.publish(topicName, data)).rejects.toThrow('Publish error');
    });
  });

  describe('topicExists', () => {
    it('should check if a topic exists', async () => {
      // Mock exists to return true
      mockTopic.exists.mockResolvedValueOnce([true]);

      // Call topicExists
      const exists = await publisher.topicExists('test-topic');

      // Verify exists was called
      expect(mockTopic.exists).toHaveBeenCalled();

      // Verify the result
      expect(exists).toBe(true);
    });

    it('should return false if topic does not exist', async () => {
      // Mock exists to return false
      mockTopic.exists.mockResolvedValueOnce([false]);

      // Call topicExists
      const exists = await publisher.topicExists('test-topic');

      // Verify the result
      expect(exists).toBe(false);
    });

    it('should return false if checking existence throws', async () => {
      // Mock exists to throw
      mockTopic.exists.mockRejectedValueOnce(new Error('Exists error'));

      // Call topicExists (should not throw)
      const exists = await publisher.topicExists('test-topic');

      // Verify the result
      expect(exists).toBe(false);
    });
  });
});
