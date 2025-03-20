declare const app: import("express-serve-static-core").Express;
interface ServiceInfo {
    url: string;
    healthCheckUrl?: string;
    metadata: Record<string, any>;
    lastHeartbeat: number;
}
declare class ServiceRegistry {
    private services;
    register(name: string, info: Omit<ServiceInfo, 'lastHeartbeat'>): void;
    update(name: string, info: Partial<Omit<ServiceInfo, 'lastHeartbeat'>>): boolean;
    get(name: string): ServiceInfo | undefined;
    getAll(): Record<string, ServiceInfo>;
    recordHeartbeat(name: string): boolean;
    removeStaleServices(maxAgeSec?: number): void;
    delete(name: string): boolean;
    get count(): number;
}
declare const registry: ServiceRegistry;
declare const startServer: (port?: number | string) => import("http").Server<typeof import("http").IncomingMessage, typeof import("http").ServerResponse>;
export { app, registry, startServer };
