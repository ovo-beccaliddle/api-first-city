#!/usr/bin/env node

/**
 * Load environment variables from workshop root and service-specific .env files
 * This ensures consistent environment variables across all services
 */

import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';

// Get the current package directory
const packageDir = process.cwd();
const workshopRoot = path.resolve(packageDir.includes('/workshop/') 
  ? packageDir.substring(0, packageDir.indexOf('/workshop/') + 9) 
  : path.resolve(__dirname, '..'));

console.log(`🔧 Loading environment variables for ${path.relative(workshopRoot, packageDir) || 'workshop root'}`);

// Load root .env first
const rootEnvPath = path.join(workshopRoot, '.env');
if (fs.existsSync(rootEnvPath)) {
  console.log(`Loading variables from ${rootEnvPath}`);
  dotenv.config({ path: rootEnvPath });
}

// Then load package-specific .env to override if needed
const packageEnvPath = path.join(packageDir, '.env');
if (fs.existsSync(packageEnvPath) && packageDir !== workshopRoot) {
  console.log(`Loading variables from ${packageEnvPath}`);
  dotenv.config({ path: packageEnvPath });
}

// Log critical environment variables for debugging
console.log(`Environment details:`);
console.log(`- NODE_ENV: ${process.env.NODE_ENV || 'not set'}`);
if (process.env.PORT) {
  console.log(`- PORT: ${process.env.PORT}`);
}
console.log(`- DB_HOST: ${process.env.DB_HOST || 'not set'}`);
console.log(`- SERVICE_REGISTRY_URL: ${process.env.SERVICE_REGISTRY_URL || 'not set'}`);
console.log(`- IAM_URL: ${process.env.IAM_URL || 'not set'}`);

// Pass all arguments to the actual command
const args = process.argv.slice(2);
if (args.length > 0) {
  console.log(`Executing command: ${args.join(' ')}`);
  
  try {
    const { spawnSync } = await import('child_process');
    const result = spawnSync(args[0], args.slice(1), { 
      stdio: 'inherit',
      env: process.env
    });
    
    // Handle command not found errors (ENOENT)
    if (result.error) {
      if (result.error.code === 'ENOENT') {
        console.error(`\n❌ Command not found: ${args[0]}`);
        console.error(`This typically happens when the command is not in your PATH or not installed.`);
        
        // Check if this is a local node module command
        const localBinPath = path.join(packageDir, 'node_modules', '.bin', args[0]);
        if (fs.existsSync(localBinPath)) {
          console.error(`\nThe command exists locally at: ${localBinPath}`);
          console.error(`Try using one of these options to fix this issue:`);
          console.error(`1. Update your package.json script to use "npx ${args[0]}" instead`);
          console.error(`2. Run "yarn install" or "npm install" to ensure dependencies are properly linked`);
        } else {
          console.error(`\nPossible solutions:`);
          console.error(`1. Install the package globally: npm install -g ${args[0]}`);
          console.error(`2. Update your package.json script to use "npx ${args[0]}"`);
          console.error(`3. Run "yarn install" or "npm install" in your project directory`); 
        }
      } else {
        console.error(`Error executing command: ${result.error.message}`);
      }
      process.exit(1);
    }
    
    // Properly propagate the exit code from the child process
    console.log(`Command exited with code: ${result.status}`);
    process.exit(result.status);
  } catch (error) {
    console.error('Failed to execute command:', error);
    process.exit(1);
  }
} 