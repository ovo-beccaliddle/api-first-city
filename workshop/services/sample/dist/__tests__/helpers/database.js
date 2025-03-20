import { DataSource } from 'typeorm';
import { ResourceEntity } from '../../models/resource.entity';
let testDataSource;
const testConfig = {
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: `${process.env.DB_DATABASE || 'sample_service'}_test`,
    entities: [ResourceEntity],
    migrations: ['src/migrations/*.ts'],
    migrationsRun: true,
    dropSchema: true,
    synchronize: true,
    logging: true,
};
export async function setupTestDatabase() {
    try {
        if (testDataSource?.isInitialized) {
            return testDataSource;
        }
        console.log('Initializing test database with config:', testConfig);
        testDataSource = new DataSource(testConfig);
        console.log('Attempting to initialize database connection...');
        await testDataSource.initialize();
        console.log('Database connection initialized successfully');
        return testDataSource;
    }
    catch (error) {
        console.error('Failed to initialize test database:', error);
        throw error;
    }
}
export async function clearTestData() {
    if (!testDataSource?.isInitialized) {
        throw new Error('Test database is not initialized');
    }
    try {
        // Get all entities metadata
        const entities = testDataSource.entityMetadatas;
        console.log('Clearing data for entities:', entities.map(e => e.name));
        // Clear each entity table
        for (const entity of entities) {
            try {
                const repository = testDataSource.getRepository(entity.name);
                await repository.clear();
                console.log(`Successfully cleared table ${entity.name}`);
            }
            catch (error) {
                console.warn(`Failed to clear table ${entity.name}:`, error);
                // Continue with other tables even if one fails
            }
        }
    }
    catch (error) {
        console.error('Failed to clear test data:', error);
        throw error;
    }
}
export async function teardownTestDatabase() {
    try {
        if (testDataSource?.isInitialized) {
            console.log('Destroying test database connection...');
            await testDataSource.destroy();
            console.log('Test database connection destroyed successfully');
        }
    }
    catch (error) {
        console.error('Failed to teardown test database:', error);
        throw error;
    }
}
export { testDataSource };
