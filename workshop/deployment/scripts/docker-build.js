#!/usr/bin/env node

/**
 * Script to build Docker images for services in a Turborepo monorepo
 * This script ensures proper context is provided to Docker builds
 */

import { execSync } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';

// Root directory of the monorepo
const REPO_ROOT = path.resolve(__dirname, '../../');

// Types of packages that can be built
const PACKAGE_TYPES = {
  INFRASTRUCTURE: 'infrastructure',
  SERVICE: 'services'
};

// Main function
function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('Building all packages...');
    buildAllPackages();
  } else {
    const [type, name] = args;
    if (!Object.values(PACKAGE_TYPES).includes(type)) {
      console.error(`Invalid package type: ${type}. Must be one of: ${Object.values(PACKAGE_TYPES).join(', ')}`);
      process.exit(1);
    }
    
    if (!name) {
      console.error('Package name is required');
      process.exit(1);
    }
    
    buildImage(type, name);
  }
}

/**
 * Build a specific image
 */
function buildImage(type, name) {
  const packagePath = path.join(REPO_ROOT, type, name);
  
  if (!fs.existsSync(packagePath)) {
    console.error(`Package not found: ${packagePath}`);
    process.exit(1);
  }
  
  // Run Turborepo build for dependencies
  console.log(`Running Turborepo build for ${type}/${name}...`);
  execSync(`cd ${REPO_ROOT} && npx turbo run build --filter=${type}/${name}...`, { stdio: 'inherit' });
  
  // Build Docker image
  console.log(`Building Docker image for ${type}/${name}...`);
  const dockerCommand = createDockerBuildCommand(type, name);
  
  try {
    execSync(dockerCommand, { stdio: 'inherit', cwd: REPO_ROOT });
    console.log(`Successfully built image for ${type}/${name}`);
  } catch (error) {
    console.error(`Failed to build image for ${type}/${name}:`, error.message);
    process.exit(1);
  }
}

/**
 * Build all packages that have a Dockerfile
 */
function buildAllPackages() {
  // Run Turborepo build for all packages
  console.log('Running Turborepo build for all packages...');
  execSync(`cd ${REPO_ROOT} && npx turbo run build`, { stdio: 'inherit' });
  
  // Find all packages with Dockerfiles
  Object.values(PACKAGE_TYPES).forEach(type => {
    const typePath = path.join(REPO_ROOT, type);
    
    if (!fs.existsSync(typePath)) {
      return;
    }
    
    fs.readdirSync(typePath, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name)
      .forEach(name => {
        const dockerfilePath = path.join(typePath, name, 'Dockerfile');
        
        if (fs.existsSync(dockerfilePath)) {
          console.log(`Building Docker image for ${type}/${name}...`);
          const dockerCommand = createDockerBuildCommand(type, name);
          
          try {
            execSync(dockerCommand, { stdio: 'inherit', cwd: REPO_ROOT });
            console.log(`Successfully built image for ${type}/${name}`);
          } catch (error) {
            console.error(`Failed to build image for ${type}/${name}:`, error.message);
          }
        }
      });
  });
}

/**
 * Create a Docker build command with proper context
 */
function createDockerBuildCommand(type, name) {
  const imageName = `city-services/${type}-${name}`;
  
  // Build context is the monorepo root
  // This allows Dockerfiles to reference files from anywhere in the monorepo
  return `docker build -t ${imageName} -f ${type}/${name}/Dockerfile --build-arg PACKAGE_PATH=${type}/${name} .`;
}

main(); 