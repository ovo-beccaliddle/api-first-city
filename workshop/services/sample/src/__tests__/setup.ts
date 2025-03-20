import { setupTestDatabase, teardownTestDatabase, clearTestData } from './helpers/database';
import { beforeAll, afterAll, beforeEach } from 'vitest';

// Set up the database once before all tests
beforeAll(async () => {
  console.log('🔄 Setting up test database for all tests...');
  try {
    await setupTestDatabase();
    console.log('✅ Test database setup complete');
  } catch (error) {
    console.error('❌ Failed to set up test database:', error);
    // Don't throw, allow tests to handle missing database
  }
});

// Clear all data before each test to ensure isolation
beforeEach(async () => {
  console.log('🧹 Clearing test data before test...');
  try {
    await clearTestData();
    console.log('✅ Test data cleared');
  } catch (error) {
    console.error('❌ Failed to clear test data:', error);
  }
});

// Clean up after all tests are done
afterAll(async () => {
  console.log('🔄 Cleaning up test database...');
  try {
    await teardownTestDatabase();
    console.log('✅ Test database cleaned up successfully');
  } catch (error) {
    console.error('❌ Failed to clean up test database:', error);
  }
}); 