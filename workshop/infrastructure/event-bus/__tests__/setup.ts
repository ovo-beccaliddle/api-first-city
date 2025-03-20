// Global test setup for event-bus tests
import { beforeEach, vi } from 'vitest';

// Define types for mocks
type MockFunction = jest.Mock<any, any>;

// Mock functions that will be used across all tests
export const mocks = {
  publish: vi.fn().mockResolvedValue('mock-message-id'),
  exists: vi.fn().mockResolvedValue([true]),
  createTopic: vi.fn().mockResolvedValue([{ name: 'mock-topic' }]),
  createSubscription: vi.fn().mockResolvedValue([
    {
      on: vi.fn(),
      close: vi.fn().mockResolvedValue(undefined),
      removeListener: vi.fn(),
    },
  ]),
  subscriptionOn: vi.fn(),
  subscriptionClose: vi.fn().mockResolvedValue(undefined),
  subscriptionRemoveListener: vi.fn(),
};

// Spy on mocks to track calls
vi.spyOn(mocks, 'publish');
vi.spyOn(mocks, 'exists');
vi.spyOn(mocks, 'createTopic');
vi.spyOn(mocks, 'createSubscription');

// Mock the entire @google-cloud/pubsub module
vi.mock('@google-cloud/pubsub', () => {
  return {
    PubSub: vi.fn().mockImplementation(() => ({
      topic: vi.fn().mockImplementation((name) => ({
        name,
        publish: mocks.publish,
        exists: mocks.exists,
        createSubscription: mocks.createSubscription,
      })),
      createTopic: mocks.createTopic,
    })),
  };
});

// Reset all mocks before each test
beforeEach(() => {
  vi.clearAllMocks();

  // Reset default behaviors
  mocks.exists.mockResolvedValue([true]);
  mocks.publish.mockResolvedValue('mock-message-id');
  mocks.createTopic.mockResolvedValue([{ name: 'mock-topic' }]);
  mocks.createSubscription.mockResolvedValue([
    {
      on: mocks.subscriptionOn,
      close: mocks.subscriptionClose,
      removeListener: mocks.subscriptionRemoveListener,
    },
  ]);
  mocks.subscriptionClose.mockResolvedValue(undefined);
});

// Mute console output to reduce noise during tests
vi.spyOn(console, 'log').mockImplementation(() => {});
vi.spyOn(console, 'error').mockImplementation(() => {});
