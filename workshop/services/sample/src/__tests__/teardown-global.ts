import { teardownTestDatabase } from './helpers/database';
import { execSync } from 'child_process';

export default async function() {
  console.log('🔄 Global teardown: cleaning up test database...');
  
  try {
    // Clean up the database
    await teardownTestDatabase();
    console.log('✅ Global teardown: database connection closed successfully');
    
    // Make sure the container is stopped and removed
    try {
      console.log('🔄 Global teardown: stopping and removing test container...');
      execSync('./scripts/teardown-test-db.sh', { stdio: 'inherit' });
      console.log('✅ Global teardown: test container removed successfully');
    } catch (containerError) {
      console.error('⚠️ Global teardown: error stopping container (may already be stopped):', containerError);
    }
  } catch (error) {
    console.error('❌ Global teardown: error cleaning up database:', error);
    
    // Even if the database cleanup fails, try to stop the container
    try {
      execSync('./scripts/teardown-test-db.sh', { stdio: 'inherit' });
    } catch (containerError) {
      console.error('❌ Global teardown: error stopping container:', containerError);
    }
  }
} 