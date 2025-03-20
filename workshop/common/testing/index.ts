/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Testing utilities for city services
 */

import { Request, Response } from 'express';
import { Logger } from '../logging';

/**
 * Creates a mock Express Request object
 */
export function createMockRequest(overrides: Partial<Request> = {}): Partial<Request> {
  const req: Partial<Request> = {
    headers: { 'x-request-id': 'test-request-id', ...overrides.headers },
    query: {},
    params: {},
    body: {},
    method: 'GET',
    path: '/',
    ip: '127.0.0.1',
    ...overrides,
  };

  // Add logger to request
  (req as any).logger = new Logger({
    service: 'test-service',
    requestId: req.headers?.['x-request-id'] as string,
  });

  return req;
}

/**
 * Custom type for the mock response that contains the additional properties and methods we need
 */
type MockResponse = Partial<Response> & {
  _headers: Record<string, string>;
  body?: any;
  emit: (event: string, ...args: any[]) => void;
};

/**
 * Creates a mock Express Response object
 */
export function createMockResponse(overrides: Partial<Response> = {}): MockResponse {
  // Event listeners storage
  const listeners: Record<string, ((args: any[]) => void)[]> = {};

  // Create the response object with base properties
  const res = {
    statusCode: 200,
    headersSent: false,
    _headers: {} as Record<string, string>,

    // Add methods with proper typing
    status: function (this: MockResponse, code: number): MockResponse {
      this.statusCode = code;
      return this;
    },

    json: function (this: MockResponse, body: any): MockResponse {
      this.body = body;
      return this;
    },

    send: function (this: MockResponse, body: any): MockResponse {
      this.body = body;
      return this;
    },

    end: function (this: MockResponse): MockResponse {
      return this;
    },

    setHeader: function (this: MockResponse, name: string, value: string): MockResponse {
      this._headers[name] = value;
      return this;
    },

    getHeader: function (this: MockResponse, name: string): string | undefined {
      return this._headers[name];
    },

    // Set up event handling
    on: function (
      this: MockResponse,
      event: string,
      callback: (...args: any[]) => void
    ): MockResponse {
      if (!listeners[event]) {
        listeners[event] = [];
      }
      listeners[event].push(callback);
      return this;
    },

    // Add emit method for triggering events
    emit: function (event: string, ...args: any[]): void {
      if (listeners[event]) {
        listeners[event].forEach((callback) => callback(args));
      }
    },

    ...overrides,
  } as MockResponse;

  return res;
}

/**
 * Base class for mock repositories
 */
export class MockRepository<T extends { id: string }> {
  protected items: T[] = [];

  constructor(initialItems: T[] = []) {
    this.reset(initialItems);
  }

  reset(items: T[] = []): void {
    this.items = [...items];
  }

  getAll(): T[] {
    return [...this.items];
  }

  getById(id: string): T | undefined {
    return this.items.find((item) => item.id === id);
  }

  create(item: T): T {
    this.items.push(item);
    return item;
  }

  update(id: string, updates: Partial<T>): T | undefined {
    const index = this.items.findIndex((item) => item.id === id);
    if (index === -1) return undefined;

    const updatedItem = { ...this.items[index], ...updates };
    this.items[index] = updatedItem;
    return updatedItem;
  }

  delete(id: string): boolean {
    const initialLength = this.items.length;
    this.items = this.items.filter((item) => item.id !== id);
    return this.items.length !== initialLength;
  }

  query(predicate: (item: T) => boolean): T[] {
    return this.items.filter(predicate);
  }
}

/**
 * Mock implementation of an event publisher
 */
export class MockEventPublisher {
  private events: Array<{ topic: string; data: any }> = [];

  reset(): void {
    this.events = [];
  }

  publish(topic: string, data: any): Promise<void> {
    this.events.push({ topic, data });
    return Promise.resolve();
  }

  getPublishedEvents(): Array<{ topic: string; data: any }> {
    return [...this.events];
  }

  getEventsForTopic(topic: string): any[] {
    return this.events.filter((event) => event.topic === topic).map((event) => event.data);
  }
}

/**
 * Mock implementation of a service registry client
 */
export class MockServiceRegistry {
  private services: Record<string, any> = {};

  reset(initialServices: Record<string, any> = {}): void {
    this.services = { ...initialServices };
  }

  register(name: string, details: any): Promise<void> {
    this.services[name] = details;
    return Promise.resolve();
  }

  getService(name: string): any {
    return this.services[name];
  }

  getAllServices(): Record<string, any> {
    return { ...this.services };
  }

  sendHeartbeat(name: string): Promise<void> {
    if (this.services[name]) {
      this.services[name].lastHeartbeat = new Date();
    }
    return Promise.resolve();
  }
}

/**
 * Utility to generate test data
 */
export function generateTestId(): string {
  return `test-${Math.floor(Math.random() * 10000)}`;
}

/**
 * Create a test environment for integration tests
 */
export async function setupTestEnvironment(services: string[]): Promise<Record<string, string>> {
  // In a real implementation, this would start test containers or mock services
  const serviceUrls: Record<string, string> = {};

  // For the workshop, we'll just return mock URLs
  services.forEach((service) => {
    serviceUrls[service] = `http://${service}.test`;
  });

  return serviceUrls;
}

/**
 * Tear down the test environment
 */
export async function teardownTestEnvironment(): Promise<void> {
  // In a real implementation, this would stop containers or clean up resources
  return Promise.resolve();
}
