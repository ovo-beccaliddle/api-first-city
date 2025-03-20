"use strict";
/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Testing utilities for city services
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.MockServiceRegistry = exports.MockEventPublisher = exports.MockRepository = void 0;
exports.createMockRequest = createMockRequest;
exports.createMockResponse = createMockResponse;
exports.generateTestId = generateTestId;
exports.setupTestEnvironment = setupTestEnvironment;
exports.teardownTestEnvironment = teardownTestEnvironment;
const logging_1 = require("../logging");
/**
 * Creates a mock Express Request object
 */
function createMockRequest(overrides = {}) {
    const req = {
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
    req.logger = new logging_1.Logger({
        service: 'test-service',
        requestId: req.headers?.['x-request-id'],
    });
    return req;
}
/**
 * Creates a mock Express Response object
 */
function createMockResponse(overrides = {}) {
    // Event listeners storage
    const listeners = {};
    // Create the response object with base properties
    const res = {
        statusCode: 200,
        headersSent: false,
        _headers: {},
        // Add methods with proper typing
        status: function (code) {
            this.statusCode = code;
            return this;
        },
        json: function (body) {
            this.body = body;
            return this;
        },
        send: function (body) {
            this.body = body;
            return this;
        },
        end: function () {
            return this;
        },
        setHeader: function (name, value) {
            this._headers[name] = value;
            return this;
        },
        getHeader: function (name) {
            return this._headers[name];
        },
        // Set up event handling
        on: function (event, callback) {
            if (!listeners[event]) {
                listeners[event] = [];
            }
            listeners[event].push(callback);
            return this;
        },
        // Add emit method for triggering events
        emit: function (event, ...args) {
            if (listeners[event]) {
                listeners[event].forEach((callback) => callback(args));
            }
        },
        ...overrides,
    };
    return res;
}
/**
 * Base class for mock repositories
 */
class MockRepository {
    constructor(initialItems = []) {
        this.items = [];
        this.reset(initialItems);
    }
    reset(items = []) {
        this.items = [...items];
    }
    getAll() {
        return [...this.items];
    }
    getById(id) {
        return this.items.find((item) => item.id === id);
    }
    create(item) {
        this.items.push(item);
        return item;
    }
    update(id, updates) {
        const index = this.items.findIndex((item) => item.id === id);
        if (index === -1)
            return undefined;
        const updatedItem = { ...this.items[index], ...updates };
        this.items[index] = updatedItem;
        return updatedItem;
    }
    delete(id) {
        const initialLength = this.items.length;
        this.items = this.items.filter((item) => item.id !== id);
        return this.items.length !== initialLength;
    }
    query(predicate) {
        return this.items.filter(predicate);
    }
}
exports.MockRepository = MockRepository;
/**
 * Mock implementation of an event publisher
 */
class MockEventPublisher {
    constructor() {
        this.events = [];
    }
    reset() {
        this.events = [];
    }
    publish(topic, data) {
        this.events.push({ topic, data });
        return Promise.resolve();
    }
    getPublishedEvents() {
        return [...this.events];
    }
    getEventsForTopic(topic) {
        return this.events.filter((event) => event.topic === topic).map((event) => event.data);
    }
}
exports.MockEventPublisher = MockEventPublisher;
/**
 * Mock implementation of a service registry client
 */
class MockServiceRegistry {
    constructor() {
        this.services = {};
    }
    reset(initialServices = {}) {
        this.services = { ...initialServices };
    }
    register(name, details) {
        this.services[name] = details;
        return Promise.resolve();
    }
    getService(name) {
        return this.services[name];
    }
    getAllServices() {
        return { ...this.services };
    }
    sendHeartbeat(name) {
        if (this.services[name]) {
            this.services[name].lastHeartbeat = new Date();
        }
        return Promise.resolve();
    }
}
exports.MockServiceRegistry = MockServiceRegistry;
/**
 * Utility to generate test data
 */
function generateTestId() {
    return `test-${Math.floor(Math.random() * 10000)}`;
}
/**
 * Create a test environment for integration tests
 */
async function setupTestEnvironment(services) {
    // In a real implementation, this would start test containers or mock services
    const serviceUrls = {};
    // For the workshop, we'll just return mock URLs
    services.forEach((service) => {
        serviceUrls[service] = `http://${service}.test`;
    });
    return serviceUrls;
}
/**
 * Tear down the test environment
 */
async function teardownTestEnvironment() {
    // In a real implementation, this would stop containers or clean up resources
    return Promise.resolve();
}
//# sourceMappingURL=index.js.map