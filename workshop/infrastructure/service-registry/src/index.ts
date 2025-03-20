// Export client for other services to use
export * from './client';

// This file is just a barrel export, the server is started directly from server.ts

export { ServiceRegistryClient } from './client';
