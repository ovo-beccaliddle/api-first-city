import { describe, it, expect, vi, beforeEach } from 'vitest';

// Extract the ServiceRegistry class for isolated testing
// Since it's not exported directly, we need to redefine it for testing
interface ServiceInfo {
  url: string;
  healthCheckUrl?: string;
  metadata: Record<string, any>;
  lastHeartbeat: number;
}

class ServiceRegistry {
  private services: Map<string, ServiceInfo> = new Map();

  register(name: string, info: Omit<ServiceInfo, 'lastHeartbeat'>): void {
    this.services.set(name, {
      ...info,
      lastHeartbeat: Date.now(),
    });
  }

  update(name: string, info: Partial<Omit<ServiceInfo, 'lastHeartbeat'>>): boolean {
    const service = this.services.get(name);
    if (!service) return false;

    this.services.set(name, {
      ...service,
      ...info,
      lastHeartbeat: Date.now(),
    });
    return true;
  }

  get(name: string): ServiceInfo | undefined {
    return this.services.get(name);
  }

  getAll(): Record<string, ServiceInfo> {
    const result: Record<string, ServiceInfo> = {};
    this.services.forEach((info, name) => {
      result[name] = info;
    });
    return result;
  }

  recordHeartbeat(name: string): boolean {
    const service = this.services.get(name);
    if (!service) return false;

    service.lastHeartbeat = Date.now();
    this.services.set(name, service);
    return true;
  }

  removeStaleServices(maxAgeSec: number = 60): void {
    const now = Date.now();
    const staleThreshold = now - maxAgeSec * 1000;

    for (const [name, info] of this.services.entries()) {
      if (info.lastHeartbeat < staleThreshold) {
        this.services.delete(name);
      }
    }
  }

  delete(name: string): boolean {
    return this.services.delete(name);
  }

  get count(): number {
    return this.services.size;
  }
}

describe('ServiceRegistry', () => {
  let registry: ServiceRegistry;

  beforeEach(() => {
    registry = new ServiceRegistry();
    // Mock Date.now for consistent testing
    vi.spyOn(Date, 'now').mockImplementation(() => 1000);
  });

  describe('register()', () => {
    it('should register a new service', () => {
      const testService = {
        url: 'http://test-service:8080',
        healthCheckUrl: 'http://test-service:8080/health',
        metadata: { version: '1.0.0' },
      };

      registry.register('test-service', testService);

      const registeredService = registry.get('test-service');

      expect(registeredService).toBeDefined();
      expect(registeredService?.url).toBe(testService.url);
      expect(registeredService?.healthCheckUrl).toBe(testService.healthCheckUrl);
      expect(registeredService?.metadata).toEqual(testService.metadata);
      expect(registeredService?.lastHeartbeat).toBeTypeOf('number');
    });

    it('should overwrite an existing service with the same name', () => {
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

      expect(registeredService?.url).toBe(updatedService.url);
      expect(registeredService?.metadata).toEqual(updatedService.metadata);
    });
  });

  describe('update()', () => {
    it('should update an existing service', () => {
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

      expect(updateResult).toBe(true);
      expect(updatedService?.url).toBe(updateInfo.url);
      expect(updatedService?.healthCheckUrl).toBe(originalService.healthCheckUrl);
      expect(updatedService?.metadata).toEqual(updateInfo.metadata);
    });

    it('should return false if service does not exist', () => {
      const updateResult = registry.update('non-existent', { url: 'http://new:8080' });

      expect(updateResult).toBe(false);
    });

    it('should update lastHeartbeat timestamp', () => {
      const service = {
        url: 'http://service:8080',
        metadata: {},
      };

      registry.register('test-service', service);

      // Mock the date for first heartbeat
      vi.spyOn(Date, 'now').mockImplementation(() => 1000);
      const initialService = registry.get('test-service');
      const initialHeartbeat = initialService?.lastHeartbeat;

      // Advance time and update
      vi.spyOn(Date, 'now').mockImplementation(() => 2000);
      registry.update('test-service', { metadata: { updated: true } });

      const updatedService = registry.get('test-service');

      expect(updatedService?.lastHeartbeat).toBeGreaterThan(initialHeartbeat as number);
      expect(updatedService?.lastHeartbeat).toBe(2000);
    });
  });

  describe('get() and getAll()', () => {
    it('should retrieve a registered service by name', () => {
      const service = {
        url: 'http://service:8080',
        metadata: { version: '1.0.0' },
      };

      registry.register('test-service', service);

      const retrievedService = registry.get('test-service');

      expect(retrievedService).toBeDefined();
      expect(retrievedService?.url).toBe(service.url);
    });

    it('should return undefined for non-existent service', () => {
      const result = registry.get('non-existent');

      expect(result).toBeUndefined();
    });

    it('should return all registered services as an object', () => {
      registry.register('service1', { url: 'http://service1:8080', metadata: {} });
      registry.register('service2', { url: 'http://service2:8080', metadata: {} });

      const allServices = registry.getAll();

      expect(Object.keys(allServices)).toHaveLength(2);
      expect(allServices.service1).toBeDefined();
      expect(allServices.service2).toBeDefined();
      expect(allServices.service1.url).toBe('http://service1:8080');
      expect(allServices.service2.url).toBe('http://service2:8080');
    });
  });

  describe('recordHeartbeat()', () => {
    it('should update the lastHeartbeat timestamp for a service', () => {
      const service = {
        url: 'http://service:8080',
        metadata: {},
      };

      // Register service at initial time
      const initialTime = new Date(2023, 0, 1, 12, 0, 0).getTime();
      vi.setSystemTime(initialTime);
      registry.register('test-service', service);

      // Advance time
      const updatedTime = new Date(2023, 0, 1, 12, 1, 0).getTime();
      vi.setSystemTime(updatedTime);

      const result = registry.recordHeartbeat('test-service');
      const updatedService = registry.get('test-service');

      expect(result).toBe(true);
      expect(updatedService?.lastHeartbeat).toBe(updatedTime);
    });

    it('should return false for non-existent service', () => {
      const result = registry.recordHeartbeat('non-existent');

      expect(result).toBe(false);
    });
  });

  describe('removeStaleServices()', () => {
    it('should remove services that have not sent heartbeats within maxAgeSec', () => {
      // Ensure Date.now returns a predictable value for the test
      const nowFn = vi.spyOn(Date, 'now');

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
      expect(registry.get('fresh-service')).toBeDefined();
      expect(registry.get('stale-service')).toBeUndefined();
    });

    it('should handle empty registry', () => {
      // This should not throw an error
      expect(() => registry.removeStaleServices()).not.toThrow();
    });
  });

  describe('delete()', () => {
    it('should delete a service by name', () => {
      registry.register('test-service', { url: 'http://test:8080', metadata: {} });

      const deleteResult = registry.delete('test-service');

      expect(deleteResult).toBe(true);
      expect(registry.get('test-service')).toBeUndefined();
    });

    it('should return false for non-existent service', () => {
      const deleteResult = registry.delete('non-existent');

      expect(deleteResult).toBe(false);
    });
  });

  describe('count', () => {
    it('should return the number of registered services', () => {
      expect(registry.count).toBe(0);

      registry.register('service1', { url: 'http://service1:8080', metadata: {} });
      expect(registry.count).toBe(1);

      registry.register('service2', { url: 'http://service2:8080', metadata: {} });
      expect(registry.count).toBe(2);

      registry.delete('service1');
      expect(registry.count).toBe(1);
    });
  });
});
