import type { ListResourcesResponse, CreateResourceResponse, GetResourceResponse, UpdateResourceResponse, HealthCheckResponse } from './types.gen';
export declare const listResourcesResponseTransformer: (data: any) => Promise<ListResourcesResponse>;
export declare const createResourceResponseTransformer: (data: any) => Promise<CreateResourceResponse>;
export declare const getResourceResponseTransformer: (data: any) => Promise<GetResourceResponse>;
export declare const updateResourceResponseTransformer: (data: any) => Promise<UpdateResourceResponse>;
export declare const healthCheckResponseTransformer: (data: any) => Promise<HealthCheckResponse>;
