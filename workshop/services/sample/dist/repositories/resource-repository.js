import dataSource from '../config/database';
import { ResourceEntity } from '../models/resource.entity';
import { ResourceStatus, } from '../generated/types.gen';
/**
 * Repository class for managing resource entities in the database.
 * Provides data access methods and implements TypeORM repository pattern.
 *
 * @class ResourceRepository
 */
export class ResourceRepository {
    /**
     * Creates an instance of ResourceRepository.
     * Initializes the TypeORM repository for ResourceEntity.
     *
     * @constructor
     * @param {DataSource} [customDataSource] - Optional custom data source for testing
     */
    constructor(customDataSource) {
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
    getRepository(queryRunner) {
        return queryRunner ? queryRunner.manager.getRepository(ResourceEntity) : this.repository;
    }
    /**
     * Maps a ResourceEntity to a Resource type.
     *
     * @private
     * @param {ResourceEntity} entity - The entity to map
     * @returns {Resource} The mapped resource
     */
    mapEntityToResource(entity) {
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
    async findAll(options) {
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
            items: items,
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
     * @returns {Promise<Resource | null>} A promise that resolves to the found resource or null if not found
     */
    async findById(id) {
        const entity = await this.repository.findOneBy({ id });
        return entity;
    }
    /**
     * Creates a new resource within an optional transaction.
     *
     * @async
     * @param {ResourceCreate} data - The resource data to create
     * @param {QueryRunner} [queryRunner] - Optional query runner for transaction context
     * @returns {Promise<Resource>} A promise that resolves to the created resource
     */
    async create(data, queryRunner) {
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
    async update(id, data, queryRunner) {
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
    async delete(id, queryRunner) {
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
    async seed(count = 10) {
        const statuses = Object.values(ResourceStatus);
        for (let i = 0; i < count; i++) {
            const status = statuses[i % statuses.length];
            const partialEntity = {
                name: `Resource ${i + 1}`,
                description: `This is a sample resource ${i + 1}`,
                status: status, // Cast to ensure type safety
                tags: [`tag-${i % 3}`, `sample`, `type-${i % 5}`],
            };
            const entity = this.repository.create(partialEntity);
            await this.repository.save(entity);
        }
    }
    /**
     * Executes a function within a transaction.
     * If the function throws an error, the transaction is rolled back.
     * If the function completes successfully, the transaction is committed.
     *
     * @async
     * @template T - The return type of the callback function
     * @param {(repo: ResourceRepository) => Promise<T>} callback - The function to execute within the transaction
     * @returns {Promise<T>} A promise that resolves to the result of the callback function
     */
    async transaction(callback) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const transactionRepo = new ResourceRepository(queryRunner.manager.connection);
            const result = await callback(transactionRepo);
            await queryRunner.commitTransaction();
            return result;
        }
        catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        }
        finally {
            await queryRunner.release();
        }
    }
}
