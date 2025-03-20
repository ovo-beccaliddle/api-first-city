"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startServer = exports.registry = exports.app = void 0;
const express_1 = __importDefault(require("express"));
const common_1 = require("@city-services/common");
const app = (0, express_1.default)();
exports.app = app;
// Middleware
app.use(express_1.default.json());
app.use((0, common_1.requestLogger)('service-registry'));
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
    // Remove stale services that haven't sent a heartbeat recently
    removeStaleServices(maxAgeSec = 60) {
        const now = Date.now();
        const staleThreshold = now - maxAgeSec * 1000;
        for (const [name, info] of this.services.entries()) {
            if (info.lastHeartbeat < staleThreshold) {
                this.services.delete(name);
            }
        }
    }
    // Delete a service by name
    delete(name) {
        return this.services.delete(name);
    }
    // Get the count of registered services
    get count() {
        return this.services.size;
    }
}
const registry = new ServiceRegistry();
exports.registry = registry;
// Start background task to remove stale services
setInterval(() => {
    registry.removeStaleServices();
}, 30000); // Check every 30 seconds
// Register a service
app.post('/register', (req, res) => {
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
app.put('/services/:name', (req, res) => {
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
    }
    else {
        return res.status(500).json({
            error: 'update_failed',
            message: 'Failed to update service',
        });
    }
});
// Delete a service
app.delete('/services/:name', (req, res) => {
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
app.post('/heartbeat/:name', (req, res) => {
    const name = req.params.name;
    const updated = registry.recordHeartbeat(name);
    if (updated) {
        return res.json({
            status: 'ok',
            timestamp: new Date().toISOString(),
        });
    }
    else {
        return res.status(404).json({
            error: 'not_found',
            message: `Service '${name}' not found`,
        });
    }
});
// Get a specific service
app.get('/services/:name', (req, res) => {
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
app.get('/services', (req, res) => {
    return res.json(registry.getAll());
});
// Health check endpoint
app.get('/health', (req, res) => {
    return res.json({
        status: 'ok',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        services: registry.count,
    });
});
// Add error handler middleware
app.use(common_1.errorHandler);
// Function to start the server (for better testability)
const startServer = (port = process.env.PORT || 3000) => {
    return app.listen(port, () => {
        console.log(`Service Registry running on port ${port}`);
    });
};
exports.startServer = startServer;
// Only start the server if this file is run directly
if (require.main === module) {
    startServer();
}
//# sourceMappingURL=server.js.map