import type { Options as ClientOptions, TDataShape, Client } from '@hey-api/client-fetch';
import type { ListResourcesData, CreateResourceData, DeleteResourceData, GetResourceData, UpdateResourceData, HealthCheckData } from './types.gen';
export type Options<TData extends TDataShape = TDataShape, ThrowOnError extends boolean = boolean> = ClientOptions<TData, ThrowOnError> & {
    /**
     * You can provide a client instance returned by `createClient()` instead of
     * individual options. This might be also useful if you want to implement a
     * custom client.
     */
    client?: Client;
    /**
     * You can pass arbitrary values through the `meta` object. This can be
     * used to access values that aren't defined as part of the SDK function.
     */
    meta?: Record<string, unknown>;
};
/**
 * List resources
 * Retrieve a paginated list of resources
 */
export declare const listResources: <ThrowOnError extends boolean = false>(options?: Options<ListResourcesData, ThrowOnError>) => import("@hey-api/client-fetch").RequestResult<import("./types.gen").ResourceList, import("./types.gen")._Error, ThrowOnError>;
/**
 * Create a new resource
 * Create a new resource with the provided data
 */
export declare const createResource: <ThrowOnError extends boolean = false>(options: Options<CreateResourceData, ThrowOnError>) => import("@hey-api/client-fetch").RequestResult<import("./types.gen").Resource, import("./types.gen")._Error, ThrowOnError>;
/**
 * Delete a resource
 * Remove a resource from the system
 */
export declare const deleteResource: <ThrowOnError extends boolean = false>(options: Options<DeleteResourceData, ThrowOnError>) => import("@hey-api/client-fetch").RequestResult<void, import("./types.gen")._Error, ThrowOnError>;
/**
 * Get a resource by ID
 * Retrieve detailed information about a specific resource
 */
export declare const getResource: <ThrowOnError extends boolean = false>(options: Options<GetResourceData, ThrowOnError>) => import("@hey-api/client-fetch").RequestResult<import("./types.gen").Resource, import("./types.gen")._Error, ThrowOnError>;
/**
 * Update a resource
 * Update an existing resource with new data
 */
export declare const updateResource: <ThrowOnError extends boolean = false>(options: Options<UpdateResourceData, ThrowOnError>) => import("@hey-api/client-fetch").RequestResult<import("./types.gen").Resource, import("./types.gen")._Error, ThrowOnError>;
/**
 * Health check
 * Check the health status of the service
 */
export declare const healthCheck: <ThrowOnError extends boolean = false>(options?: Options<HealthCheckData, ThrowOnError>) => import("@hey-api/client-fetch").RequestResult<{
    status: "ok" | "degraded" | "down";
    version?: string;
    timestamp: Date;
}, unknown, ThrowOnError>;
