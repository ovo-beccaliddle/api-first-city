import { Application } from 'express';
/**
 * Sets up Swagger UI for the Express application
 *
 * @param app Express application
 * @param apiSpecPath Path to the OpenAPI YAML file
 * @returns void
 */
export declare function setupSwaggerUI(app: Application, apiSpecPath: string): void;
