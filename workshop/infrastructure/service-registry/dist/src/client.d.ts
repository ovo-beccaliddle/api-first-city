/**
 * Service Registry Client
 *
 * A simple client utility for services to register with
 * and discover other services from the registry.
 */
export interface ServiceInfo {
    url: string;
    healthCheckUrl?: string;
    metadata: Record<string, any>;
    lastHeartbeat: number;
}
export interface RegistryClientOptions {
    registryUrl: string;
    serviceName: string;
    serviceUrl: string;
    healthCheckUrl?: string;
    metadata?: Record<string, any>;
    heartbeatInterval?: number;
}
export declare class ServiceRegistryClient {
    private options;
    private heartbeatInterval?;
    private isRegistered;
    constructor(options: RegistryClientOptions);
    /**
     * Register the service with the registry
     */
    register(): Promise<boolean>;
    /**
     * Start sending heartbeats to the registry
     */
    private startHeartbeat;
    /**
     * Discover a service by name
     */
    discover(serviceName: string): Promise<ServiceInfo | null>;
    /**
     * List all registered services
     */
    listAll(): Promise<Record<string, ServiceInfo>>;
    /**
     * Unregister the service when shutting down
     */
    unregister(): Promise<boolean>;
}
