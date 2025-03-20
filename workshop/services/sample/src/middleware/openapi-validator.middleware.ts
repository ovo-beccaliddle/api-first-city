import { Request, Response, NextFunction } from 'express';
import { ValidationError } from '@city-services/common';
import { z } from 'zod';

// Import all generated Zod schemas
import * as schemas from '../generated/zod.gen';

type HttpMethod = 'get' | 'post' | 'put' | 'delete' | 'patch';


interface RouteConfig {
  method: HttpMethod;
  path: string;
  requestSchema?: {
    body?: z.ZodType;
    query?: z.ZodType;
    params?: z.ZodType;
  };
  responseSchema?: z.ZodType;
}

// Map of routes to their schema configurations
const routeSchemas = new Map<string, RouteConfig>([
  // GET /resources
  ['/resources:get', {
    method: 'get',
    path: '/resources',
    requestSchema: {
      query: z.object({
        page: z.coerce.number().int().nonnegative().optional(),
        page_size: z.coerce.number().int().positive().optional(),
        name: z.string().optional(),
      }).strict(),
    },
    responseSchema: schemas.zListResourcesResponse,
  }],
  // POST /resources
  ['/resources:post', {
    method: 'post',
    path: '/resources',
    requestSchema: {
      body: schemas.zResourceCreate,
    },
    responseSchema: schemas.zCreateResourceResponse,
  }],
  // GET /resources/:id
  ['/resources/{id}:get', {
    method: 'get',
    path: '/resources/:id',
    requestSchema: {
      params: z.object({ id: z.string() }).strict(),
    },
    responseSchema: schemas.zGetResourceResponse,
  }],
  // PUT /resources/:id
  ['/resources/{id}:put', {
    method: 'put',
    path: '/resources/:id',
    requestSchema: {
      params: z.object({ id: z.string() }).strict(),
      body: schemas.zResourceUpdate,
    },
    responseSchema: schemas.zUpdateResourceResponse,
  }],
  // DELETE /resources/:id
  ['/resources/{id}:delete', {
    method: 'delete',
    path: '/resources/:id',
    requestSchema: {
      params: z.object({ id: z.string() }).strict(),
    },
    responseSchema: schemas.zDeleteResourceResponse,
  }],
  // GET /health
  ['/health:get', {
    method: 'get',
    path: '/health',
    responseSchema: schemas.zHealthCheckResponse,
  }],
]);

/**
 * Convert Express path to OpenAPI path format
 */
function expressPathToOpenAPI(path: string): string {
  return path.replace(/:([^/]+)/g, '{$1}');
}

/**
 * Get route configuration for the current request
 */
function getRouteConfig(req: Request): RouteConfig | undefined {
  const openAPIPath = expressPathToOpenAPI(req.route.path);
  const key = `${openAPIPath}:${req.method.toLowerCase()}`;
  return routeSchemas.get(key);
}

/**
 * Validate request data against schema
 */
async function validateRequestData(data: any, schema: z.ZodType) {
  try {
    return await schema.parseAsync(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const details = error.errors.map(err => ({
        path: err.path.join('.'),
        message: err.message,
      }));
      throw new ValidationError(details);
    }
    throw error;
  }
}

/**
 * Middleware to validate requests and responses based on OpenAPI schemas
 */
export function validateOpenAPI() {
  return async (req: Request, res: Response, next: NextFunction) => {
    const config = getRouteConfig(req);
    if (!config) {
      // No schema configuration found for this route
      return next();
    }

    try {
      // Validate request
      if (config.requestSchema) {
        if (config.requestSchema.body && Object.keys(req.body).length > 0) {
          req.body = await validateRequestData(req.body, config.requestSchema.body);
        }
        if (config.requestSchema.query && Object.keys(req.query).length > 0) {
          req.query = await validateRequestData(req.query, config.requestSchema.query);
        }
        if (config.requestSchema.params && Object.keys(req.params).length > 0) {
          req.params = await validateRequestData(req.params, config.requestSchema.params);
        }
      }

      // Capture the response to validate it
      const originalJson = res.json;
      res.json = function(body: any) {
        if (config.responseSchema) {
          try {
            body = config.responseSchema.parse(body);
          } catch (error) {
            if (error instanceof z.ZodError) {
              const details = error.errors.map(err => ({
                path: err.path.join('.'),
                message: err.message,
              }));
              next(new ValidationError(details));
              return res;
            }
            next(error);
            return res;
          }
        }
        return originalJson.call(this, body);
      };

      next();
    } catch (error) {
      next(error);
    }
  };
} 