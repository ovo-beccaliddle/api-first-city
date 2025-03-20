/**
 * Testing utilities for city services
 */
import { Request, Response } from 'express';
/**
 * Creates a mock Express Request object
 */
export declare function createMockRequest(overrides?: Partial<Request>): Partial<Request>;
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
export declare function createMockResponse(overrides?: Partial<Response>): MockResponse;
/**
 * Base class for mock repositories
 */
export declare class MockRepository<T extends {
    id: string;
}> {
    protected items: T[];
    constructor(initialItems?: T[]);
    reset(items?: T[]): void;
    getAll(): T[];
    getById(id: string): T | undefined;
    create(item: T): T;
    update(id: string, updates: Partial<T>): T | undefined;
    delete(id: string): boolean;
    query(predicate: (item: T) => boolean): T[];
}
/**
 * Mock implementation of an event publisher
 */
export declare class MockEventPublisher {
    private events;
    reset(): void;
    publish(topic: string, data: any): Promise<void>;
    getPublishedEvents(): Array<{
        topic: string;
        data: any;
    }>;
    getEventsForTopic(topic: string): any[];
}
/**
 * Mock implementation of a service registry client
 */
export declare class MockServiceRegistry {
    private services;
    reset(initialServices?: Record<string, any>): void;
    register(name: string, details: any): Promise<void>;
    getService(name: string): any;
    getAllServices(): Record<string, any>;
    sendHeartbeat(name: string): Promise<void>;
}
/**
 * Utility to generate test data
 */
export declare function generateTestId(): string;
/**
 * Create a test environment for integration tests
 */
export declare function setupTestEnvironment(services: string[]): Promise<Record<string, string>>;
/**
 * Tear down the test environment
 */
export declare function teardownTestEnvironment(): Promise<void>;
export {};
