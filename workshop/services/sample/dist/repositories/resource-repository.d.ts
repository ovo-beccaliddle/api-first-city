import { type Resource, type ResourceCreate, type ResourceUpdate, type ResourceList } from '../generated/types.gen';
/**
 * Options for filtering and paginating resource queries.
 *
 * @interface FindAllOptions
 * @property {string} [name] - Optional name filter for resources
 * @property {number} [page] - Page number for pagination (1-based indexing)
 * @property {number} [page_size] - Number of items per page
 */
interface FindAllOptions {
    name?: string;
    page?: number;
    page_size?: number;
}
/**
 * Repository class for managing resource entities in the database.
 * Provides data access methods and implements TypeORM repository pattern.
 *
 * @class ResourceRepository
 */
export declare class ResourceRepository {
    private repository;
    /**
     * Creates an instance of ResourceRepository.
     * Initializes the TypeORM repository for ResourceEntity.
     *
     * @constructor
     */
    constructor();
    /**
     * Retrieves a paginated list of resources with optional filtering.
     *
     * @async
     * @param {FindAllOptions} [options] - Optional parameters for filtering and pagination
     * @returns {Promise<ResourceList>} A promise that resolves to a paginated list of resources
     */
    findAll(options?: FindAllOptions): Promise<ResourceList>;
    /**
     * Finds a resource by its unique identifier.
     *
     * @async
     * @param {string} id - The unique identifier of the resource
     * @returns {Promise<Resource | null>} A promise that resolves to the found resource or null if not found
     */
    findById(id: string): Promise<Resource | null>;
    /**
     * Creates a new resource with the provided data.
     *
     * @async
     * @param {ResourceCreate} data - The data for creating a new resource
     * @returns {Promise<Resource>} A promise that resolves to the newly created resource
     */
    create(data: ResourceCreate): Promise<Resource>;
    /**
     * Updates an existing resource with the provided data.
     *
     * @async
     * @param {string} id - The unique identifier of the resource to update
     * @param {ResourceUpdate} data - The data to update the resource with
     * @returns {Promise<Resource | null>} A promise that resolves to the updated resource or null if not found
     */
    update(id: string, data: ResourceUpdate): Promise<Resource | null>;
    /**
     * Deletes a resource by its unique identifier.
     *
     * @async
     * @param {string} id - The unique identifier of the resource to delete
     * @returns {Promise<boolean>} A promise that resolves to true if the resource was deleted, false otherwise
     */
    delete(id: string): Promise<boolean>;
    /**
     * Seeds the repository with sample data for development/testing purposes.
     *
     * @async
     * @param {number} [count=10] - The number of sample resources to create
     * @returns {Promise<void>} A promise that resolves when seeding is complete
     */
    seed(count?: number): Promise<void>;
}
export {};
