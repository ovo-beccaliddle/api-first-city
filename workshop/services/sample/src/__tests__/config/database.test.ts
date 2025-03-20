import { describe, it, beforeAll, afterAll, expect } from 'vitest';
import { DataSource } from 'typeorm';
import { ResourceEntity } from '../../models/resource.entity';
import { setupTestDatabase, clearTestData, teardownTestDatabase } from '../helpers/database';

/**
 * Test database configuration that uses a separate database for testing.
 * This ensures tests don't interfere with development data.
 */
const testConfig = {
  type: 'postgres' as const,
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: `${process.env.DB_DATABASE || 'sample_service'}_test`,
  entities: [ResourceEntity],
  migrations: ['../../src/migrations/*.ts'],
  migrationsRun: true,
  dropSchema: true,
  synchronize: true,
  logging: true,
};

const testDataSource = new DataSource(testConfig);

export default testDataSource;

export const initializeTestDatabase = async (): Promise<DataSource> => {
  if (!testDataSource.isInitialized) {
    await testDataSource.initialize();
  }
  return testDataSource;

};

describe('Database Configuration', () => {
  let dataSource: DataSource;

  beforeAll(async () => {
    dataSource = await setupTestDatabase();
  });

  afterAll(async () => {
    await teardownTestDatabase();
  });

  it('should initialize database connection', () => {
    expect(dataSource.isInitialized).toBe(true);
  });

  it('should have correct configuration', () => {
    expect(dataSource.options.type).toBe('postgres');
    expect(dataSource.options.entities).toContain(ResourceEntity);
    expect(dataSource.options.migrations).toEqual(['src/migrations/*.ts']);
    expect(dataSource.options.migrationsRun).toBe(true);
    expect(dataSource.options.dropSchema).toBe(true);
    expect(dataSource.options.synchronize).toBe(false);
  });

  it('should have resource entity registered', () => {
    const entityMetadata = dataSource.entityMetadatas.find(
      (metadata) => metadata.name === 'ResourceEntity'
    );
    expect(entityMetadata).toBeDefined();
  });

  it('should clear test data successfully', async () => {
    // Create a test resource
    const repository = dataSource.getRepository(ResourceEntity);
    await repository.save({
      name: 'Test Resource',
      status: 'pending'
    });

    // Clear the data
    await clearTestData();

    // Verify the data is cleared
    const count = await repository.count();
    expect(count).toBe(0);
  });
}); 