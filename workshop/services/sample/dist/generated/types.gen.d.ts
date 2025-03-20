/**
 * Status of a resource
 */
export type ResourceStatus = 'active' | 'inactive' | 'pending' | 'archived';
/**
 * Status of a resource
 */
export declare const ResourceStatus: {
    readonly ACTIVE: "active";
    readonly INACTIVE: "inactive";
    readonly PENDING: "pending";
    readonly ARCHIVED: "archived";
};
export type Resource = {
    /**
     * Unique identifier for the resource
     */
    id: string;
    /**
     * Name of the resource
     */
    name: string;
    /**
     * Detailed description of the resource
     */
    description?: string;
    /**
     * Current status of the resource
     */
    status: ResourceStatus;
    /**
     * Tags associated with the resource
     */
    tags?: Array<string>;
    /**
     * When the resource was created
     */
    createdAt: Date;
    /**
     * When the resource was last updated
     */
    updatedAt: Date;
};
export type ResourceCreate = {
    /**
     * Name of the resource
     */
    name: string;
    /**
     * Detailed description of the resource
     */
    description?: string;
    /**
     * Initial status of the resource
     */
    status?: ResourceStatus;
    /**
     * Tags associated with the resource
     */
    tags?: Array<string>;
};
export type ResourceUpdate = {
    /**
     * Updated name of the resource
     */
    name?: string;
    /**
     * Updated description of the resource
     */
    description?: string;
    /**
     * Updated status of the resource
     */
    status?: ResourceStatus;
    /**
     * Updated tags for the resource
     */
    tags?: Array<string>;
};
export type ResourceList = {
    /**
     * List of resources
     */
    items: Array<Resource>;
    /**
     * Total number of resources matching the query
     */
    total: number;
    /**
     * Current page number
     */
    page: number;
    /**
     * Number of items per page
     */
    page_size: number;
};
export type _Error = {
    error: {
        /**
         * Error code
         */
        code: string;
        /**
         * Human-readable error message
         */
        message: string;
        /**
         * Additional error details
         */
        details?: {
            [key: string]: unknown;
        };
    };
};
export type ListResourcesData = {
    body?: never;
    path?: never;
    query?: {
        /**
         * Page number for pagination
         */
        page?: number;
        /**
         * Number of items per page
         */
        page_size?: number;
        /**
         * Filter resources by name
         */
        name?: string;
    };
    url: '/resources';
};
export type ListResourcesErrors = {
    /**
     * Invalid request parameters
     */
    400: _Error;
    /**
     * Unauthorized
     */
    401: _Error;
};
export type ListResourcesError = ListResourcesErrors[keyof ListResourcesErrors];
export type ListResourcesResponses = {
    /**
     * List of resources
     */
    200: ResourceList;
};
export type ListResourcesResponse = ListResourcesResponses[keyof ListResourcesResponses];
export type CreateResourceData = {
    body: ResourceCreate;
    path?: never;
    query?: never;
    url: '/resources';
};
export type CreateResourceErrors = {
    /**
     * Invalid request data
     */
    400: _Error;
    /**
     * Unauthorized
     */
    401: _Error;
};
export type CreateResourceError = CreateResourceErrors[keyof CreateResourceErrors];
export type CreateResourceResponses = {
    /**
     * Resource created
     */
    201: Resource;
};
export type CreateResourceResponse = CreateResourceResponses[keyof CreateResourceResponses];
export type DeleteResourceData = {
    body?: never;
    path: {
        /**
         * Resource ID
         */
        id: string;
    };
    query?: never;
    url: '/resources/{id}';
};
export type DeleteResourceErrors = {
    /**
     * Unauthorized
     */
    401: _Error;
    /**
     * Resource not found
     */
    404: _Error;
};
export type DeleteResourceError = DeleteResourceErrors[keyof DeleteResourceErrors];
export type DeleteResourceResponses = {
    /**
     * Resource deleted
     */
    204: void;
};
export type DeleteResourceResponse = DeleteResourceResponses[keyof DeleteResourceResponses];
export type GetResourceData = {
    body?: never;
    path: {
        /**
         * Resource ID
         */
        id: string;
    };
    query?: never;
    url: '/resources/{id}';
};
export type GetResourceErrors = {
    /**
     * Unauthorized
     */
    401: _Error;
    /**
     * Resource not found
     */
    404: _Error;
};
export type GetResourceError = GetResourceErrors[keyof GetResourceErrors];
export type GetResourceResponses = {
    /**
     * Resource details
     */
    200: Resource;
};
export type GetResourceResponse = GetResourceResponses[keyof GetResourceResponses];
export type UpdateResourceData = {
    body: ResourceUpdate;
    path: {
        /**
         * Resource ID
         */
        id: string;
    };
    query?: never;
    url: '/resources/{id}';
};
export type UpdateResourceErrors = {
    /**
     * Invalid request data
     */
    400: _Error;
    /**
     * Unauthorized
     */
    401: _Error;
    /**
     * Resource not found
     */
    404: _Error;
};
export type UpdateResourceError = UpdateResourceErrors[keyof UpdateResourceErrors];
export type UpdateResourceResponses = {
    /**
     * Resource updated
     */
    200: Resource;
};
export type UpdateResourceResponse = UpdateResourceResponses[keyof UpdateResourceResponses];
export type HealthCheckData = {
    body?: never;
    path?: never;
    query?: never;
    url: '/health';
};
export type HealthCheckResponses = {
    /**
     * Service health information
     */
    200: {
        status: 'ok' | 'degraded' | 'down';
        version?: string;
        timestamp: Date;
    };
};
export type HealthCheckResponse = HealthCheckResponses[keyof HealthCheckResponses];
export type ClientOptions = {
    baseUrl: 'http://localhost:3001' | 'http://localhost:8082/sample' | (string & {});
};
