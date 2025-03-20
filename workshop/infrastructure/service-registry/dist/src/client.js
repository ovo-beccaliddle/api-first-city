"use strict";
/**
 * Service Registry Client
 *
 * A simple client utility for services to register with
 * and discover other services from the registry.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServiceRegistryClient = void 0;
class ServiceRegistryClient {
    constructor(options) {
        this.isRegistered = false;
        this.options = {
            heartbeatInterval: 30000, // 30 seconds by default
            metadata: {},
            ...options,
        };
    }
    /**
     * Register the service with the registry
     */
    async register() {
        try {
            const response = await fetch(`${this.options.registryUrl}/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: this.options.serviceName,
                    url: this.options.serviceUrl,
                    healthCheckUrl: this.options.healthCheckUrl,
                    metadata: this.options.metadata,
                }),
            });
            if (response.ok) {
                this.isRegistered = true;
                this.startHeartbeat();
                return true;
            }
            return false;
        }
        catch (error) {
            console.error('Failed to register with Service Registry:', error);
            return false;
        }
    }
    /**
     * Start sending heartbeats to the registry
     */
    startHeartbeat() {
        if (this.heartbeatInterval) {
            clearInterval(this.heartbeatInterval);
        }
        this.heartbeatInterval = setInterval(async () => {
            try {
                await fetch(`${this.options.registryUrl}/heartbeat/${this.options.serviceName}`, {
                    method: 'POST',
                });
            }
            catch (error) {
                console.error('Failed to send heartbeat to Service Registry:', error);
            }
        }, this.options.heartbeatInterval);
    }
    /**
     * Discover a service by name
     */
    async discover(serviceName) {
        try {
            const response = await fetch(`${this.options.registryUrl}/services/${serviceName}`);
            if (response.ok) {
                return await response.json();
            }
            return null;
        }
        catch (error) {
            console.error(`Failed to discover service '${serviceName}':`, error);
            return null;
        }
    }
    /**
     * List all registered services
     */
    async listAll() {
        try {
            const response = await fetch(`${this.options.registryUrl}/services`);
            if (response.ok) {
                return await response.json();
            }
            return {};
        }
        catch (error) {
            console.error('Failed to list services:', error);
            return {};
        }
    }
    /**
     * Unregister the service when shutting down
     */
    async unregister() {
        if (this.heartbeatInterval) {
            clearInterval(this.heartbeatInterval);
            this.heartbeatInterval = undefined;
        }
        if (!this.isRegistered) {
            return true;
        }
        try {
            const response = await fetch(`${this.options.registryUrl}/services/${this.options.serviceName}`, {
                method: 'DELETE',
            });
            this.isRegistered = false;
            return response.ok;
        }
        catch (error) {
            console.error('Failed to unregister from Service Registry:', error);
            return false;
        }
    }
}
exports.ServiceRegistryClient = ServiceRegistryClient;
//# sourceMappingURL=client.js.map