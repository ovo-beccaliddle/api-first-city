import express, { Application, NextFunction, Request, Response } from 'express';
import path from 'path';
import { Logger, errorHandler } from '@city-services/common';
import cors from 'cors';
import 'reflect-metadata'; // Required for TypeORM

import config from './config/config';
import { ResourceRepository } from './repositories/resource-repository';
import { ResourceService } from './services/resource-service';
import { ResourceController } from './controllers/resource-controller';
import { HealthController } from './controllers/health-controller';
import { setupSwaggerUI } from './middleware/swagger.middleware';

const logger = new Logger({ service: config.serviceName });

export async function createApp(): Promise<Application> {
  // Create Express application
  const app = express();

  // Middleware
  app.use(express.json());
  app.use(cors());

  // Setup Swagger UI
  const apiSpecPath = path.join(__dirname, '../api/openapi.yaml');
  setupSwaggerUI(app, apiSpecPath);

  // Create repositories
  logger.info('Creating repositories...');
  const resourceRepository = new ResourceRepository();

  // Create services
  logger.info('Creating services...');
  const resourceService = new ResourceService(resourceRepository);

  // Create controllers
  logger.info('Creating controllers...');
  const resourceController = new ResourceController(resourceService);
  const healthController = new HealthController(config.version);

  // Register routes
  logger.info('Registering routes...');
  app.use('/resources', resourceController.getRouter());
  app.use('/health', healthController.getRouter());

  // Error handling middleware
  app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    errorHandler(err, req, res, next);
  });

  // Seed data in development mode
  if (config.environment === 'development') {
    try {
      logger.info('Development mode: Seeding initial data...');
      await resourceService.seedData(20);
      logger.info('Initial data seeded successfully');
    } catch (err) {
      logger.error('Error seeding data', err instanceof Error ? err : new Error(String(err)));
    }
  }

  return app;
}