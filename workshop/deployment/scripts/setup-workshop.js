#!/usr/bin/env node

/**
 * Setup script for the City Services Workshop
 */

import { execSync } from 'child_process';
// import fs from 'fs';
// import path from 'path';

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

/**
 * Execute a command and print the output
 */
function executeCommand(command, options = {}) {
  console.log(`${colors.blue}> ${command}${colors.reset}`);
  try {
    const output = execSync(command, {
      stdio: 'inherit',
      ...options
    });
    return { success: true, output };
  } catch (error) {
    console.error(`${colors.red}Command failed: ${command}${colors.reset}`);
    if (options.continueOnError) {
      return { success: false, error };
    }
    process.exit(1);
  }
}

/**
 * Check if a command is available
 */
function commandExists(command) {
  try {
    execSync(`which ${command}`, { stdio: 'ignore' });
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Print a section header
 */
function printSection(title) {
  console.log(`\n${colors.cyan}=== ${title} ===${colors.reset}\n`);
}

// Start setup
console.log(`\n${colors.green}Setting up City Services Workshop Environment${colors.reset}\n`);

// Check prerequisites
printSection('Checking Prerequisites');

const prerequisites = [
  { command: 'node', message: 'Node.js is required (v20+)' },
  { command: 'yarn', message: 'Yarn is required' },
  { command: 'docker', message: 'Docker is required' },
  { command: 'docker-compose', message: 'Docker Compose is required' }
];

let missingPrerequisites = false;

prerequisites.forEach(({ command, message }) => {
  if (!commandExists(command)) {
    console.error(`${colors.red}✗ ${message}${colors.reset}`);
    missingPrerequisites = true;
  } else {
    console.log(`${colors.green}✓ ${command} is installed${colors.reset}`);
  }
});

if (missingPrerequisites) {
  console.error(`\n${colors.red}Please install missing prerequisites and try again.${colors.reset}`);
  process.exit(1);
}

// Install dependencies
printSection('Installing Dependencies');
executeCommand('yarn install');

// Install additional development dependencies
printSection('Installing Development Dependencies');
executeCommand('yarn add -D concurrently');

// Build common packages
printSection('Building Common Packages');
executeCommand('yarn workspace @city-services/common build');

// Validate API specifications
printSection('Validating API Specifications');
executeCommand('yarn workspace @city-services/sample validate-api', { 
  continueOnError: true 
});

// Setup Docker environment
printSection('Setting Up Docker Environment');
executeCommand('docker-compose -f workshop/deployment/docker-compose.yml build');

// Final instructions
printSection('Setup Complete');
console.log(`
${colors.green}The City Services Workshop environment is now set up!${colors.reset}

To start the services:
  ${colors.yellow}yarn dev${colors.reset}

To run all services directly:
  ${colors.yellow}yarn run-all${colors.reset}

To run the services in Kubernetes:
  ${colors.yellow}yarn k8s:setup${colors.reset}

For more information, see the README.md file.
`); 