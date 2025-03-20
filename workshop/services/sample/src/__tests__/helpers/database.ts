import { DataSource, DataSourceOptions } from 'typeorm';
import { ResourceEntity } from '../../models/resource.entity';

// Global singleton data source
let testDataSource: DataSource | undefined;
// Lock to prevent multiple initialization attempts
let isInitializing = false;

/**
 * Sets up the test database with proper error handling
 */
export async function setupTestDatabase(): Promise<DataSource> {
  // Return existing connection if available
  if (testDataSource?.isInitialized) {
    console.log('Returning existing database connection');
    return testDataSource;
  }

  // Wait if another initialization is in progress
  if (isInitializing) {
    console.log('Another initialization is in progress, waiting...');
    while (isInitializing) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    // Return the initialized connection if available
    if (testDataSource?.isInitialized) {
      return testDataSource;
    }
  }

  try {
    isInitializing = true;

    // Use environment variables for database config
    const testConfig: DataSourceOptions = {
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost', 
      port: parseInt(process.env.DB_PORT || '5433', 10),
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_DATABASE || 'sample_service_test',
      synchronize: true, // Create tables automatically
      dropSchema: true,  // Drop existing schema
      logging: false,
      entities: [ResourceEntity],
      migrations: [],    // Skip migrations for tests
      migrationsRun: false
    };

    console.log('Initializing test database with config:');
    // Log everything except password
    console.log({
      type: testConfig.type,
      host: testConfig.host,
      port: testConfig.port,
      username: testConfig.username,
      database: testConfig.database,
      synchronize: testConfig.synchronize,
      dropSchema: testConfig.dropSchema,
      entities: ['ResourceEntity'] // Just log the name for simplicity
    });
    
    console.log('Attempting to initialize database connection...');
    
    // Create new data source
    testDataSource = new DataSource(testConfig);
    
    // Before initializing, make sure any previous connection is closed
    try {
      // Try to drop the schema directly to ensure clean state
      await testDataSource.initialize();
      
      // Force schema drop if needed
      if (testConfig.dropSchema) {
        console.log('Force dropping schema before tests...');
        await testDataSource.dropDatabase();
        console.log('Database schema dropped');
        await testDataSource.synchronize(true);
        console.log('Schema recreated');
      }
      
      console.log('Database connection initialized successfully');
    } catch (initError) {
      console.error('Error during initialization:', initError);
      // Try one more time with clean connection
      if (testDataSource.isInitialized) {
        await testDataSource.destroy();
      }
      
      // Recreate data source with synchronize option
      testDataSource = new DataSource({
        ...testConfig,
        synchronize: true
      });
      await testDataSource.initialize();
      console.log('Database connection initialized on second attempt');
    }

    return testDataSource;
  } catch (error) {
    console.error('Failed to initialize test database:', error);
    throw error;
  } finally {
    isInitializing = false;
  }
}

/**
 * Clears all test data while maintaining the schema
 */
export async function clearTestData(): Promise<void> {
  if (!testDataSource?.isInitialized) {
    console.log('Test database is not initialized, nothing to clear');
    return;
  }

  try {
    // Get all entities metadata
    const entities = testDataSource.entityMetadatas;
    console.log('Clearing data for entities:', entities.map(e => e.name));

    // Clear each entity table
    for (const entity of entities) {
      try {
        // Direct query to truncate the table - more reliable than repository.clear()
        const tableName = entity.tableName;
        console.log(`Truncating table ${tableName}`);
        await testDataSource.query(`TRUNCATE TABLE "${tableName}" RESTART IDENTITY CASCADE`);
        console.log(`Successfully cleared table ${tableName}`);
      } catch (error) {
        console.warn(`Failed to clear table ${entity.name}:`, error);
        // Continue with other tables even if one fails
      }
    }
  } catch (error) {
    console.error('Failed to clear test data:', error);
    // Don't throw, let the test continue
  }
}

/**
 * Tears down the test database connection
 */
export async function teardownTestDatabase(): Promise<void> {
  try {
    if (testDataSource?.isInitialized) {
      console.log('Destroying test database connection...');
      await testDataSource.destroy();
      console.log('Test database connection destroyed successfully');
      testDataSource = undefined;
    } else {
      console.log('No active database connection to destroy');
    }
  } catch (error) {
    console.error('Failed to teardown test database:', error);
    // Don't throw, we want to continue with cleanup regardless
  }
}

export { testDataSource }; 