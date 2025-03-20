"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
class ServiceRegistry {
    constructor() {
        this.services = new Map();
    }
    register(name, info) {
        this.services.set(name, {
            ...info,
            lastHeartbeat: Date.now(),
        });
    }
    update(name, info) {
        const service = this.services.get(name);
        if (!service)
            return false;
        this.services.set(name, {
            ...service,
            ...info,
            lastHeartbeat: Date.now(),
        });
        return true;
    }
    get(name) {
        return this.services.get(name);
    }
    getAll() {
        const result = {};
        this.services.forEach((info, name) => {
            result[name] = info;
        });
        return result;
    }
    recordHeartbeat(name) {
        const service = this.services.get(name);
        if (!service)
            return false;
        service.lastHeartbeat = Date.now();
        this.services.set(name, service);
        return true;
    }
    removeStaleServices(maxAgeSec = 60) {
        const now = Date.now();
        const staleThreshold = now - maxAgeSec * 1000;
        for (const [name, info] of this.services.entries()) {
            if (info.lastHeartbeat < staleThreshold) {
                this.services.delete(name);
            }
        }
    }
    delete(name) {
        return this.services.delete(name);
    }
    get count() {
        return this.services.size;
    }
}
(0, vitest_1.describe)('ServiceRegistry', () => {
    let registry;
    (0, vitest_1.beforeEach)(() => {
        registry = new ServiceRegistry();
        // Mock Date.now for consistent testing
        vitest_1.vi.spyOn(Date, 'now').mockImplementation(() => 1000);
    });
    (0, vitest_1.describe)('register()', () => {
        (0, vitest_1.it)('should register a new service', () => {
            const testService = {
                url: 'http://test-service:8080',
                healthCheckUrl: 'http://test-service:8080/health',
                metadata: { version: '1.0.0' },
            };
            registry.register('test-service', testService);
            const registeredService = registry.get('test-service');
            (0, vitest_1.expect)(registeredService).toBeDefined();
            (0, vitest_1.expect)(registeredService?.url).toBe(testService.url);
            (0, vitest_1.expect)(registeredService?.healthCheckUrl).toBe(testService.healthCheckUrl);
            (0, vitest_1.expect)(registeredService?.metadata).toEqual(testService.metadata);
            (0, vitest_1.expect)(registeredService?.lastHeartbeat).toBeTypeOf('number');
        });
        (0, vitest_1.it)('should overwrite an existing service with the same name', () => {
            const originalService = {
                url: 'http://original:8080',
                metadata: { version: '1.0.0' },
            };
            const updatedService = {
                url: 'http://updated:9000',
                metadata: { version: '2.0.0' },
            };
            registry.register('test-service', originalService);
            registry.register('test-service', updatedService);
            const registeredService = registry.get('test-service');
            (0, vitest_1.expect)(registeredService?.url).toBe(updatedService.url);
            (0, vitest_1.expect)(registeredService?.metadata).toEqual(updatedService.metadata);
        });
    });
    (0, vitest_1.describe)('update()', () => {
        (0, vitest_1.it)('should update an existing service', () => {
            const originalService = {
                url: 'http://original:8080',
                healthCheckUrl: 'http://original:8080/health',
                metadata: { version: '1.0.0' },
            };
            registry.register('test-service', originalService);
            const updateInfo = {
                url: 'http://updated:9000',
                metadata: { version: '2.0.0' },
            };
            const updateResult = registry.update('test-service', updateInfo);
            const updatedService = registry.get('test-service');
            (0, vitest_1.expect)(updateResult).toBe(true);
            (0, vitest_1.expect)(updatedService?.url).toBe(updateInfo.url);
            (0, vitest_1.expect)(updatedService?.healthCheckUrl).toBe(originalService.healthCheckUrl);
            (0, vitest_1.expect)(updatedService?.metadata).toEqual(updateInfo.metadata);
        });
        (0, vitest_1.it)('should return false if service does not exist', () => {
            const updateResult = registry.update('non-existent', { url: 'http://new:8080' });
            (0, vitest_1.expect)(updateResult).toBe(false);
        });
        (0, vitest_1.it)('should update lastHeartbeat timestamp', () => {
            const service = {
                url: 'http://service:8080',
                metadata: {},
            };
            registry.register('test-service', service);
            // Mock the date for first heartbeat
            vitest_1.vi.spyOn(Date, 'now').mockImplementation(() => 1000);
            const initialService = registry.get('test-service');
            const initialHeartbeat = initialService?.lastHeartbeat;
            // Advance time and update
            vitest_1.vi.spyOn(Date, 'now').mockImplementation(() => 2000);
            registry.update('test-service', { metadata: { updated: true } });
            const updatedService = registry.get('test-service');
            (0, vitest_1.expect)(updatedService?.lastHeartbeat).toBeGreaterThan(initialHeartbeat);
            (0, vitest_1.expect)(updatedService?.lastHeartbeat).toBe(2000);
        });
    });
    (0, vitest_1.describe)('get() and getAll()', () => {
        (0, vitest_1.it)('should retrieve a registered service by name', () => {
            const service = {
                url: 'http://service:8080',
                metadata: { version: '1.0.0' },
            };
            registry.register('test-service', service);
            const retrievedService = registry.get('test-service');
            (0, vitest_1.expect)(retrievedService).toBeDefined();
            (0, vitest_1.expect)(retrievedService?.url).toBe(service.url);
        });
        (0, vitest_1.it)('should return undefined for non-existent service', () => {
            const result = registry.get('non-existent');
            (0, vitest_1.expect)(result).toBeUndefined();
        });
        (0, vitest_1.it)('should return all registered services as an object', () => {
            registry.register('service1', { url: 'http://service1:8080', metadata: {} });
            registry.register('service2', { url: 'http://service2:8080', metadata: {} });
            const allServices = registry.getAll();
            (0, vitest_1.expect)(Object.keys(allServices)).toHaveLength(2);
            (0, vitest_1.expect)(allServices.service1).toBeDefined();
            (0, vitest_1.expect)(allServices.service2).toBeDefined();
            (0, vitest_1.expect)(allServices.service1.url).toBe('http://service1:8080');
            (0, vitest_1.expect)(allServices.service2.url).toBe('http://service2:8080');
        });
    });
    (0, vitest_1.describe)('recordHeartbeat()', () => {
        (0, vitest_1.it)('should update the lastHeartbeat timestamp for a service', () => {
            const service = {
                url: 'http://service:8080',
                metadata: {},
            };
            // Register service at initial time
            const initialTime = new Date(2023, 0, 1, 12, 0, 0).getTime();
            vitest_1.vi.setSystemTime(initialTime);
            registry.register('test-service', service);
            // Advance time
            const updatedTime = new Date(2023, 0, 1, 12, 1, 0).getTime();
            vitest_1.vi.setSystemTime(updatedTime);
            const result = registry.recordHeartbeat('test-service');
            const updatedService = registry.get('test-service');
            (0, vitest_1.expect)(result).toBe(true);
            (0, vitest_1.expect)(updatedService?.lastHeartbeat).toBe(updatedTime);
        });
        (0, vitest_1.it)('should return false for non-existent service', () => {
            const result = registry.recordHeartbeat('non-existent');
            (0, vitest_1.expect)(result).toBe(false);
        });
    });
    (0, vitest_1.describe)('removeStaleServices()', () => {
        (0, vitest_1.it)('should remove services that have not sent heartbeats within maxAgeSec', () => {
            // Ensure Date.now returns a predictable value for the test
            const nowFn = vitest_1.vi.spyOn(Date, 'now');
            // Set initial time
            nowFn.mockReturnValue(1000);
            // Register two services
            registry.register('fresh-service', { url: 'http://fresh:8080', metadata: {} });
            registry.register('stale-service', { url: 'http://stale:8080', metadata: {} });
            // Advance time by 30 seconds and update fresh service
            nowFn.mockReturnValue(31000); // 30 seconds later
            registry.recordHeartbeat('fresh-service');
            // Advance time by another 40 seconds (70 seconds total)
            nowFn.mockReturnValue(71000); // 70 seconds later
            // Remove services stale for more than 60 seconds
            registry.removeStaleServices(60);
            // Check results
            (0, vitest_1.expect)(registry.get('fresh-service')).toBeDefined();
            (0, vitest_1.expect)(registry.get('stale-service')).toBeUndefined();
        });
        (0, vitest_1.it)('should handle empty registry', () => {
            // This should not throw an error
            (0, vitest_1.expect)(() => registry.removeStaleServices()).not.toThrow();
        });
    });
    (0, vitest_1.describe)('delete()', () => {
        (0, vitest_1.it)('should delete a service by name', () => {
            registry.register('test-service', { url: 'http://test:8080', metadata: {} });
            const deleteResult = registry.delete('test-service');
            (0, vitest_1.expect)(deleteResult).toBe(true);
            (0, vitest_1.expect)(registry.get('test-service')).toBeUndefined();
        });
        (0, vitest_1.it)('should return false for non-existent service', () => {
            const deleteResult = registry.delete('non-existent');
            (0, vitest_1.expect)(deleteResult).toBe(false);
        });
    });
    (0, vitest_1.describe)('count', () => {
        (0, vitest_1.it)('should return the number of registered services', () => {
            (0, vitest_1.expect)(registry.count).toBe(0);
            registry.register('service1', { url: 'http://service1:8080', metadata: {} });
            (0, vitest_1.expect)(registry.count).toBe(1);
            registry.register('service2', { url: 'http://service2:8080', metadata: {} });
            (0, vitest_1.expect)(registry.count).toBe(2);
            registry.delete('service1');
            (0, vitest_1.expect)(registry.count).toBe(1);
        });
    });
});
//# sourceMappingURL=registry.test.js.map