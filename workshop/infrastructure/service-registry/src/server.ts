import express, { Request, Response, NextFunction } from 'express';
import { errorHandler, requestLogger } from '@city-services/common';

const app = express();

// Middleware
app.use(express.json());
app.use(requestLogger('service-registry') as express.RequestHandler);

// In-memory store for service registration
// In production, this would use a distributed database
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

  // Remove stale services that haven't sent a heartbeat recently
  removeStaleServices(maxAgeSec: number = 60): void {
    const now = Date.now();
    const staleThreshold = now - maxAgeSec * 1000;

    for (const [name, info] of this.services.entries()) {
      if (info.lastHeartbeat < staleThreshold) {
        this.services.delete(name);
      }
    }
  }

  // Delete a service by name
  delete(name: string): boolean {
    return this.services.delete(name);
  }

  // Get the count of registered services
  get count(): number {
    return this.services.size;
  }
}

const registry = new ServiceRegistry();

// Start background task to remove stale services
setInterval(() => {
  registry.removeStaleServices();
}, 30000); // Check every 30 seconds

// Register a service
app.post('/register', (req: Request, res: Response) => {
  const { name, url, healthCheckUrl, metadata } = req.body;

  if (!name || !url) {
    return res.status(400).json({
      error: 'bad_request',
      message: 'Service name and URL are required',
    });
  }

  registry.register(name, {
    url,
    healthCheckUrl,
    metadata: metadata || {},
  });

  return res.status(201).json({
    status: 'registered',
    timestamp: new Date().toISOString(),
  });
});

// Update a service
app.put('/services/:name', (req: Request, res: Response) => {
  const name = req.params.name;
  const { url, healthCheckUrl, metadata } = req.body;

  if (!registry.get(name)) {
    return res.status(404).json({
      error: 'not_found',
      message: `Service '${name}' not found`,
    });
  }

  const updated = registry.update(name, {
    url,
    healthCheckUrl,
    metadata,
  });

  if (updated) {
    return res.json({
      status: 'updated',
      timestamp: new Date().toISOString(),
    });
  } else {
    return res.status(500).json({
      error: 'update_failed',
      message: 'Failed to update service',
    });
  }
});

// Delete a service
app.delete('/services/:name', (req: Request, res: Response) => {
  const name = req.params.name;
  const service = registry.get(name);

  if (!service) {
    return res.status(404).json({
      error: 'not_found',
      message: `Service '${name}' not found`,
    });
  }

  registry.delete(name);
  return res.json({
    status: 'deleted',
    timestamp: new Date().toISOString(),
  });
});

// Record a service heartbeat
app.post('/heartbeat/:name', (req: Request, res: Response) => {
  const name = req.params.name;
  const updated = registry.recordHeartbeat(name);

  if (updated) {
    return res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
    });
  } else {
    return res.status(404).json({
      error: 'not_found',
      message: `Service '${name}' not found`,
    });
  }
});

// Get a specific service
app.get('/services/:name', (req: Request, res: Response) => {
  const name = req.params.name;
  const service = registry.get(name);

  if (!service) {
    return res.status(404).json({
      error: 'not_found',
      message: `Service '${name}' not found`,
    });
  }

  return res.json(service);
});

// Get all services
app.get('/services', (req: Request, res: Response) => {
  return res.json(registry.getAll());
});

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  return res.json({
    status: 'ok',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    services: registry.count,
  });
});

// Add error handler middleware
app.use(errorHandler as express.ErrorRequestHandler);

// Function to start the server (for better testability)
const startServer = (port: number | string = process.env.PORT || 3000) => {
  return app.listen(port, () => {
    console.log(`Service Registry running on port ${port}`);
  });
};

// Only start the server if this file is run directly
if (require.main === module) {
  startServer();
}

// Export for testing
export { app, registry, startServer };
