import { Repository, DeepPartial, QueryRunner, DataSource } from 'typeorm';
import { dataSource } from '../config/database';
import { ResourceEntity } from '../models/resource.entity';
import {
  type Resource,
  type ResourceCreate,
  type ResourceUpdate,
  type ResourceList,
  ResourceStatus,
} from '../generated/types.gen';

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
export class ResourceRepository {
  private repository: Repository<ResourceEntity>;
  private dataSource: DataSource;

  /**
   * Creates an instance of ResourceRepository.
   * Initializes the TypeORM repository for ResourceEntity.
   * 
   * @constructor
   * @param {DataSource} [customDataSource] - Optional custom data source for testing
   */
  constructor(customDataSource?: DataSource) {
    this.dataSource = customDataSource || dataSource;
    this.repository = this.dataSource.getRepository(ResourceEntity);
  }

  /**
   * Gets the repository instance for the current transaction context.
   * If no transaction is provided, returns the default repository.
   * 
   * @private
   * @param {QueryRunner} [queryRunner] - Optional query runner for transaction context
   * @returns {Repository<ResourceEntity>} The repository instance to use
   */
  private getRepository(queryRunner?: QueryRunner): Repository<ResourceEntity> {
    return queryRunner ? queryRunner.manager.getRepository(ResourceEntity) : this.repository;
  }

  /**
   * Maps a ResourceEntity to a Resource type.
   * 
   * @private
   * @param {ResourceEntity} entity - The entity to map
   * @returns {Resource} The mapped resource
   */
  private mapEntityToResource(entity: ResourceEntity): Resource {
    return {
      id: entity.id,
      name: entity.name,
      description: entity.description ?? '',
      status: entity.status,
      tags: entity.tags,
      createdAt: entity.createdAt instanceof Date ? entity.createdAt : new Date(entity.createdAt),
      updatedAt: entity.updatedAt instanceof Date ? entity.updatedAt : new Date(entity.updatedAt)
    };
  }

  /**
   * Retrieves a paginated list of resources with optional filtering.
   * 
   * @async
   * @param {FindAllOptions} [options] - Optional parameters for filtering and pagination
   * @returns {Promise<ResourceList>} A promise that resolves to a paginated list of resources
   */
  async findAll(options?: FindAllOptions): Promise<ResourceList> {
    const page = options?.page ?? 1;
    const page_size = options?.page_size ?? 20;

    // Create query builder
    const queryBuilder = this.repository.createQueryBuilder('resource');

    // Apply filters
    if (options?.name) {
      queryBuilder.where('resource.name ILIKE :name', { name: `%${options.name}%` });
    }

    // Get total count
    const total = await queryBuilder.getCount();

    // Apply pagination
    const skip = (page - 1) * page_size;
    queryBuilder.skip(skip).take(page_size);

    // Order by created date
    queryBuilder.orderBy('resource.createdAt', 'DESC');

    // Execute query
    const items = await queryBuilder.getMany();

    return {
      items: items as unknown as Resource[],
      total,
      page,
      page_size,
    };
  }

  /**
   * Finds a resource by its unique identifier.
   * 
   * @async
   * @param {string} id - The unique identifier of the resource
   * @param {QueryRunner} [queryRunner] - Optional query runner for transaction context
   * @returns {Promise<Resource | null>} A promise that resolves to the found resource or null if not found
   */
  async findById(id: string, queryRunner?: QueryRunner): Promise<Resource | null> {
    const repository = this.getRepository(queryRunner);
    const entity = await repository.findOneBy({ id });
    return entity as unknown as Resource | null;
  }

  /**
   * Creates a new resource within an optional transaction.
   * 
   * @async
   * @param {ResourceCreate} data - The resource data to create
   * @param {QueryRunner} [queryRunner] - Optional query runner for transaction context
   * @returns {Promise<Resource>} A promise that resolves to the created resource
   */
  async create(data: ResourceCreate, queryRunner?: QueryRunner): Promise<Resource> {
    const repository = this.getRepository(queryRunner);
    const entity = repository.create({
      ...data,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    const saved = await repository.save(entity);
    return this.mapEntityToResource(saved);
  }

  /**
   * Updates an existing resource within an optional transaction.
   * 
   * @async
   * @param {string} id - The ID of the resource to update
   * @param {ResourceUpdate} data - The update data
   * @param {QueryRunner} [queryRunner] - Optional query runner for transaction context
   * @returns {Promise<Resource | null>} A promise that resolves to the updated resource or null if not found
   */
  async update(id: string, data: ResourceUpdate, queryRunner?: QueryRunner): Promise<Resource | null> {
    const repository = this.getRepository(queryRunner);
    const existing = await repository.findOne({ where: { id } });

    if (!existing) {
      return null;
    }

    const updated = repository.merge(existing, {
      ...data,
      updatedAt: new Date()
    });

    const saved = await repository.save(updated);
    return this.mapEntityToResource(saved);
  }

  /**
   * Deletes a resource within an optional transaction.
   * 
   * @async
   * @param {string} id - The ID of the resource to delete
   * @param {QueryRunner} [queryRunner] - Optional query runner for transaction context
   * @returns {Promise<boolean>} A promise that resolves to true if the resource was deleted
   */
  async delete(id: string, queryRunner?: QueryRunner): Promise<boolean> {
    const repository = this.getRepository(queryRunner);
    const result = await repository.delete(id);
    return result.affected ? result.affected > 0 : false;
  }

  /**
   * Seeds the repository with sample data for development/testing purposes.
   * 
   * @async
   * @param {number} [count=10] - The number of sample resources to create
   * @returns {Promise<void>} A promise that resolves when seeding is complete
   */
  async seed(count = 10): Promise<void> {
    const statuses = Object.values(ResourceStatus);

    for (let i = 0; i < count; i++) {
      const status = statuses[i % statuses.length];
      const partialEntity: DeepPartial<ResourceEntity> = {
        name: `Resource ${i + 1}`,
        description: `This is a sample resource ${i + 1}`,
        status: status as ResourceStatus, // Cast to ensure type safety
        tags: [`tag-${i % 3}`, `sample`, `type-${i % 5}`],
      };

      const entity = this.repository.create(partialEntity);
      await this.repository.save(entity);
    }
  }
}

