import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { EventBus } from '../src/index';
import { EventPublisher } from '../src/publisher';
import { EventSubscriber } from '../src/subscriber';

// Mock the imported modules
vi.mock('../src/publisher', () => ({
  EventPublisher: vi.fn(),
}));

vi.mock('../src/subscriber', () => ({
  EventSubscriber: vi.fn().mockImplementation(() => ({
    closeAll: vi.fn().mockResolvedValue(undefined),
  })),
}));

describe('EventBus', () => {
  let eventBus: EventBus;
  let mockCloseAll: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    // Reset environment
    vi.clearAllMocks();

    // Set up mock for closeAll method
    mockCloseAll = vi.fn().mockResolvedValue(undefined);
    (EventSubscriber as unknown as ReturnType<typeof vi.fn>).mockImplementation(() => ({
      closeAll: mockCloseAll,
    }));

    // Create a new event bus for each test
    eventBus = new EventBus({
      projectId: 'test-project',
      emulatorHost: 'localhost:8085',
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('constructor', () => {
    it('should create publisher and subscriber with options', () => {
      // Verify publisher was created with options
      expect(EventPublisher).toHaveBeenCalledWith({
        projectId: 'test-project',
        emulatorHost: 'localhost:8085',
      });

      // Verify subscriber was created with options
      expect(EventSubscriber).toHaveBeenCalledWith({
        projectId: 'test-project',
        emulatorHost: 'localhost:8085',
      });
    });

    it('should create publisher and subscriber with default options', () => {
      // Create event bus with no options
      new EventBus();

      // Verify publisher and subscriber were created with empty options
      expect(EventPublisher).toHaveBeenCalledWith({});
      expect(EventSubscriber).toHaveBeenCalledWith({});
    });
  });

  describe('close', () => {
    it('should close all subscriptions', async () => {
      // Call the close method
      await eventBus.close();

      // Verify closeAll was called
      expect(mockCloseAll).toHaveBeenCalledTimes(1);
    });
  });
});
