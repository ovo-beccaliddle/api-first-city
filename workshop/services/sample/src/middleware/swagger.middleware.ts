import express, { Application } from 'express';
import * as yaml from 'js-yaml';
import fs from 'fs';
import { absolutePath } from 'swagger-ui-dist';
import { expressCspHeader, INLINE, SELF } from 'express-csp-header';

import { Logger } from '@city-services/common';
import config from '../config/config';

const logger = new Logger({ service: config.serviceName });

/**
 * Sets up Swagger UI for the Express application
 *
 * @param app Express application
 * @param apiSpecPath Path to the OpenAPI YAML file
 * @returns void
 */
export function setupSwaggerUI(app: Application, apiSpecPath: string): void {
  try {
    // Apply CSP middleware specifically for Swagger UI routes to allow necessary resources
    app.use(
      ['/api-docs', '/api-spec.json'],
      expressCspHeader({
        directives: {
          'default-src': [SELF],
          'script-src': [SELF, INLINE],
          'style-src': [SELF, INLINE],
          'img-src': [SELF, 'data:'],
          'font-src': [SELF],
          'object-src': [SELF],
          'connect-src': [SELF],
        },
      })
    );

    // Create a route to serve the OpenAPI spec as JSON
    app.get('/api-spec.json', (_req, res) => {
      try {
        const yamlContent = fs.readFileSync(apiSpecPath, 'utf8');
        const jsonContent = yaml.load(yamlContent);
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify(jsonContent));
      } catch (err) {
        res.status(500).send(`Error converting YAML to JSON: ${err}`);
      }
    });

    // This approach follows the recommended Swagger UI implementation from:
    // https://github.com/swagger-api/swagger-ui/blob/HEAD/docs/usage/installation.md
    // We're using swagger-ui-dist to serve the static assets and creating a custom
    // HTML page with our preferred configuration options.
    const swaggerUiAssetPath = absolutePath();

    // Create custom HTML for Swagger UI with advanced configuration options
    const swaggerHtml = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Sample Service API Documentation</title>
      <link rel="stylesheet" type="text/css" href="./swagger-ui.css" />
      <link rel="stylesheet" type="text/css" href="./index.css" />
      <link rel="icon" type="image/png" href="./favicon-32x32.png" sizes="32x32" />
      <link rel="icon" type="image/png" href="./favicon-16x16.png" sizes="16x16" />
      <style>
        body {
          margin: 0;
          background: #fafafa;
        }
        .swagger-ui .topbar { 
          background-color: #1f2937;
        }
        .swagger-ui .info .title {
          font-size: 24px;
        }
        .swagger-ui .scheme-container {
          box-shadow: none;
        }
      </style>
    </head>
    <body>
      <div id="swagger-ui"></div>
      <script src="./swagger-ui-bundle.js" charset="UTF-8"></script>
      <script src="./swagger-ui-standalone-preset.js" charset="UTF-8"></script>
      <script>
        window.onload = function() {
          // Begin Swagger UI call region
          window.ui = SwaggerUIBundle({
            url: "/api-spec.json",
            dom_id: '#swagger-ui',
            deepLinking: true,
            presets: [
              SwaggerUIBundle.presets.apis,
              SwaggerUIStandalonePreset
            ],
            plugins: [
              SwaggerUIBundle.plugins.DownloadUrl
            ],
            layout: "StandaloneLayout",
            docExpansion: "list",
            tagsSorter: "alpha",
            operationsSorter: "alpha",
            defaultModelsExpandDepth: 1,
            defaultModelExpandDepth: 3,
            displayRequestDuration: true,
            filter: true,
            supportedSubmitMethods: ["get", "put", "post", "delete", "options", "head", "patch"],
            tryItOutEnabled: true
          });
          // End Swagger UI call region
        }
      </script>
    </body>
    </html>
    `;

    // Serve Swagger UI assets
    app.use('/api-docs', express.static(swaggerUiAssetPath, { index: false }));

    // Serve customized Swagger UI index
    app.get('/api-docs', (_req, res) => {
      res.setHeader('Content-Type', 'text/html');
      res.send(swaggerHtml);
    });

    logger.info('API documentation available at /api-docs');
  } catch (error) {
    logger.error('Failed to set up API documentation:', error as Error);
  }
}
