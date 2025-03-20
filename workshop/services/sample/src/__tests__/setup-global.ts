import { setupTestDatabase } from './helpers/database';

export default async function() {
  console.log('🔄 Global setup: initializing test database...');
  
  try {
    // Set up the database once for all tests
    await setupTestDatabase();
    console.log('✅ Global setup: test database initialized successfully');
  } catch (error) {
    console.error('❌ Global setup: failed to initialize test database:', error);
    // Don't throw here, allow tests to continue and possibly skip if DB isn't available
  }
} 