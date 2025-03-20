import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import * as OpenApiValidator from 'express-openapi-validator';
import { Logger, requestLogger } from '@city-services/common';
import cors from 'cors';
import helmet from 'helmet';
import 'reflect-metadata'; // Required for TypeORM

import config, { initializeConfig } from './config/config';
import { initializeDatabase } from './config/database';
import { setupSwaggerUI } from './middleware/swagger.middleware';
import { createApp } from './app';

// Create Express application
const app = express();
const logger = new Logger({ service: config.serviceName });

// Security middleware
app.use(helmet());
app.use(cors());

// Middleware
app.use(express.json());
app.use((req: Request, res: Response, next: NextFunction) => {
  requestLogger(config.serviceName)(req, res, next);
});

// Set up OpenAPI spec path
const apiSpecPath = path.join(__dirname, '../api/openapi.yaml');

// Set up Swagger UI for API documentation
setupSwaggerUI(app, apiSpecPath);

// Set up OpenAPI validation
app.use(
  OpenApiValidator.middleware({
    apiSpec: apiSpecPath,
    validateRequests: true,
    validateResponses: false, // Set to true in development to validate responses
  })
);

// Function to check if a service is available
async function checkServiceAvailability(url: string, serviceName: string): Promise<boolean> {
  try {
    logger.info(`Checking ${serviceName} availability at ${url}...`);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    const response = await fetch(`${url}/health`, {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (response.ok) {
      logger.info(`${serviceName} is available`);
      return true;
    } else {
      logger.warn(`${serviceName} returned status ${response.status}`);
      return false;
    }
  } catch (error) {
    logger.warn(
      `${serviceName} not available: ${error instanceof Error ? error.message : String(error)}`
    );
    return false;
  }
}

async function startServer() {
  try {
    logger.info('Starting sample service...');
    logger.info(`Environment: ${config.environment}`);
    logger.info(`Service Name: ${config.serviceName}`);
    logger.info(`Service Registry URL: ${config.serviceRegistry.url}`);
    logger.info(`IAM Service URL: ${config.iam.url}`);

    // Check service registry availability
    const isServiceRegistryAvailable = await checkServiceAvailability(
      config.serviceRegistry.url,
      'Service Registry'
    );

    if (!isServiceRegistryAvailable) {
      logger.warn(`Service Registry not available. You may need to start it with:`);
      logger.warn(`cd workshop/infrastructure/service-registry && docker-compose up`);
    }

    // Check IAM service availability
    const isIamServiceAvailable = await checkServiceAvailability(config.iam.url, 'IAM Service');

    if (!isIamServiceAvailable) {
      logger.warn(`IAM Service not available. This may affect authentication.`);
    }

    // Initialize remote configuration
    logger.info('Initializing remote configuration...');
    await initializeConfig();
    logger.info('Remote configuration initialized successfully');

    // Initialize database connection
    logger.info('Initializing database connection...');
    await initializeDatabase();
    logger.info('Database initialized successfully');

    // Get the configured app
    const app = await createApp();

    // Start the server
    const server = app.listen(config.port, () => {
      logger.info(`✅ Sample service running on port ${config.port}`);
      logger.info(`API documentation available at http://localhost:${config.port}/api-docs`);
      logger.info('Service dependencies status:');
      logger.info(`- PostgreSQL database: Connected`);
      logger.info(
        `- Service Registry: ${isServiceRegistryAvailable ? 'Available' : 'Not available'}`
      );
      logger.info(`- IAM Service: ${isIamServiceAvailable ? 'Available' : 'Not available'}`);
      logger.info('\nUseful commands:');
      logger.info('- Run everything: docker-compose up');
      logger.info('- Run database only: docker-compose up sample-service-db');
      logger.info(
        '- Run service registry: cd workshop/infrastructure/service-registry && docker-compose up'
      );
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      logger.info('SIGTERM received, shutting down');
      server.close(() => {
        logger.info('Server closed');
        process.exit(0);
      });
    });
  } catch (error) {
    logger.error(
      'Failed to start server',
      error instanceof Error ? error : new Error(String(error))
    );
    logger.error('\nPlease check:');
    logger.error('1. Database is running and accessible (DB_HOST=' + config.db.host + ')');
    logger.error(
      '2. Service Registry is running and accessible (SERVICE_REGISTRY_URL=' +
        config.serviceRegistry.url +
        ')'
    );
    logger.error('3. IAM Service is running and accessible (IAM_URL=' + config.iam.url + ')');
    logger.error('4. Environment variables are correctly set in .env file');
    logger.error('\nQuick fix:');
    logger.error('- Run database only: docker-compose up sample-service-db');
    logger.error(
      '- Run service registry: cd workshop/infrastructure/service-registry && docker-compose up'
    );
    process.exit(1);
  }
}

// Start the server
startServer();
