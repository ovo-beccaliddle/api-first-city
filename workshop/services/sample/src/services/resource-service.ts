import { ResourceList, Resource, ResourceCreate, ResourceUpdate } from '@/generated';
import { ResourceRepository } from '@/repositories/resource-repository';
import { NotFoundError } from '@city-services/common';


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
export class ResourceService {
  private repository: ResourceRepository;

  /**
   * Creates an instance of ResourceService.
   * 
   * @constructor
   * @param {ResourceRepository} repository - The repository instance for data access
   */
  constructor(repository: ResourceRepository) {
    this.repository = repository;
  }

  /**
   * Retrieves a paginated list of resources with optional filtering.
   * 
   * @async
   * @param {GetResourcesOptions} [options] - Optional parameters for filtering and pagination
   * @returns {Promise<ResourceList>} A promise that resolves to a paginated list of resources
   */
  async getResources(options?: GetResourcesOptions): Promise<ResourceList> {
    return this.repository.findAll(options);
  }

  /**
   * Retrieves a single resource by its unique identifier.
   * 
   * @async
   * @param {string} id - The unique identifier of the resource
   * @returns {Promise<Resource>} A promise that resolves to the found resource
   * @throws {NotFoundError} When the resource with the given ID doesn't exist
   */
  async getResourceById(id: string): Promise<Resource> {
    const resource = await this.repository.findById(id);
    if (!resource) {
      throw new NotFoundError('Resource', id);
    }
    return resource;
  }

  /**
   * Creates a new resource with the provided data.
   * 
   * @async
   * @param {ResourceCreate} data - The data for creating a new resource
   * @returns {Promise<Resource>} A promise that resolves to the newly created resource
   */
  async createResource(data: ResourceCreate): Promise<Resource> {
    return this.repository.create(data);
  }

  /**
   * Updates an existing resource with the provided data.
   * 
   * @async
   * @param {string} id - The unique identifier of the resource to update
   * @param {ResourceUpdate} data - The data to update the resource with
   * @returns {Promise<Resource>} A promise that resolves to the updated resource
   * @throws {NotFoundError} When the resource with the given ID doesn't exist
   */
  async updateResource(id: string, data: ResourceUpdate): Promise<Resource> {
    const updatedResource = await this.repository.update(id, data);
    if (!updatedResource) {
      throw new NotFoundError('Resource', id);
    }
    return updatedResource;
  }

  /**
   * Deletes a resource by its unique identifier.
   * 
   * @async
   * @param {string} id - The unique identifier of the resource to delete
   * @returns {Promise<void>} A promise that resolves when the resource is deleted
   * @throws {NotFoundError} When the resource with the given ID doesn't exist
   */
  async deleteResource(id: string): Promise<void> {
    const deleted = await this.repository.delete(id);
    if (!deleted) {
      throw new NotFoundError('Resource', id);
    }
  }

  // /**
  //  * Seeds the repository with sample data for development/testing purposes.
  //  * 
  //  * @async
  //  * @param {number} [count=10] - The number of sample resources to create
  //  * @returns {Promise<void>} A promise that resolves when seeding is complete
  //  */
  // async seedData(count = 10): Promise<void> {
  //   await this.repository.seed(count);
  // }
}
