import type { Resource, ResourceCreate, ResourceUpdate, ResourceList } from '@generated/types.gen';
import { ResourceRepository } from '@repositories/resource-repository';
/**
 * Options for retrieving resources with pagination and filtering.
 *
 * @interface GetResourcesOptions
 * @property {string} [name] - Optional filter to search resources by name
 * @property {number} [page] - Page number for pagination (1-based indexing)
 * @property {number} [page_size] - Number of items per page
 */
interface GetResourcesOptions {
    name?: string;
    page?: number;
    page_size?: number;
}
/**
 * Service class responsible for handling resource business logic.
 * Implements operations for managing resources including CRUD operations
 * and data validation.
 *
 * @class ResourceService
 */
export declare class ResourceService {
    private repository;
    /**
     * Creates an instance of ResourceService.
     *
     * @constructor
     * @param {ResourceRepository} repository - The repository instance for data access
     */
    constructor(repository: ResourceRepository);
    /**
     * Retrieves a paginated list of resources with optional filtering.
     *
     * @async
     * @param {GetResourcesOptions} [options] - Optional parameters for filtering and pagination
     * @returns {Promise<ResourceList>} A promise that resolves to a paginated list of resources
     */
    getResources(options?: GetResourcesOptions): Promise<ResourceList>;
    /**
     * Retrieves a single resource by its unique identifier.
     *
     * @async
     * @param {string} id - The unique identifier of the resource
     * @returns {Promise<Resource>} A promise that resolves to the found resource
     * @throws {NotFoundError} When the resource with the given ID doesn't exist
     */
    getResourceById(id: string): Promise<Resource>;
    /**
     * Creates a new resource with the provided data.
     *
     * @async
     * @param {ResourceCreate} data - The data for creating a new resource
     * @returns {Promise<Resource>} A promise that resolves to the newly created resource
     */
    createResource(data: ResourceCreate): Promise<Resource>;
    /**
     * Updates an existing resource with the provided data.
     *
     * @async
     * @param {string} id - The unique identifier of the resource to update
     * @param {ResourceUpdate} data - The data to update the resource with
     * @returns {Promise<Resource>} A promise that resolves to the updated resource
     * @throws {NotFoundError} When the resource with the given ID doesn't exist
     */
    updateResource(id: string, data: ResourceUpdate): Promise<Resource>;
    /**
     * Deletes a resource by its unique identifier.
     *
     * @async
     * @param {string} id - The unique identifier of the resource to delete
     * @returns {Promise<void>} A promise that resolves when the resource is deleted
     * @throws {NotFoundError} When the resource with the given ID doesn't exist
     */
    deleteResource(id: string): Promise<void>;
    /**
     * Seeds the repository with sample data for development/testing purposes.
     *
     * @async
     * @param {number} [count=10] - The number of sample resources to create
     * @returns {Promise<void>} A promise that resolves when seeding is complete
     */
    seedData(count?: number): Promise<void>;
}
export {};
