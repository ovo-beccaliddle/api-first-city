import { ResourceStatus } from '../generated/types.gen';
import type { Resource } from '../generated/types.gen';
/**
 * TypeORM entity representing a resource in the database.
 * Implements the Resource interface from the OpenAPI specification,
 * excluding the timestamp fields which are handled by TypeORM decorators.
 *
 * @class ResourceEntity
 * @implements {Omit<Resource, 'createdAt' | 'updatedAt'>}
 */
export declare class ResourceEntity implements Omit<Resource, 'createdAt' | 'updatedAt'> {
    /**
     * Unique identifier for the resource.
     * Uses UUID v4 format.
     *
     * @type {string}
     */
    id: string;
    /**
     * Name of the resource.
     * Required field that cannot be null.
     *
     * @type {string}
     */
    name: string;
    /**
     * Optional description of the resource.
     *
     * @type {string | undefined}
     */
    description?: string;
    /**
     * Current status of the resource.
     * Uses an enum to restrict possible values.
     * Defaults to ACTIVE if not specified.
     *
     * @type {ResourceStatus}
     * @default ResourceStatus.ACTIVE
     */
    status: ResourceStatus;
    /**
     * Array of tags associated with the resource.
     * Stored as a string array in the database.
     *
     * @type {string[]}
     */
    tags: string[];
    /**
     * Timestamp of when the resource was created.
     * Automatically managed by TypeORM.
     *
     * @type {Date}
     */
    createdAt: Date;
    /**
     * Timestamp of when the resource was last updated.
     * Automatically managed by TypeORM.
     *
     * @type {Date}
     */
    updatedAt: Date;
}
