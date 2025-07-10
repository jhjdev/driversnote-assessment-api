import { FastifyInstance } from 'fastify';
import { SwaggerOptions } from '@fastify/swagger';
import { SwaggerUiOptions } from '@fastify/swagger-ui';

export interface SwaggerConfig {
  title: string;
  description: string;
  version: string;
  host: string;
  schemes: string[];
  consumes: string[];
  produces: string[];
}

export const defaultSwaggerConfig: SwaggerConfig = {
  title: 'Driversnote Assessment API',
  description: 'API service for Driversnote assessment with MongoDB',
  version: '1.0.0',
  host: 'localhost:4000',
  schemes: ['http', 'https'],
  consumes: ['application/json'],
  produces: ['application/json'],
};

export async function registerSwagger(
  fastify: FastifyInstance,
  config: SwaggerConfig = defaultSwaggerConfig
): Promise<void> {
  try {
    const swaggerOptions: SwaggerOptions = {
      swagger: {
        info: {
          title: config.title,
          description: config.description,
          version: config.version,
        },
        host: config.host,
        schemes: config.schemes,
        consumes: config.consumes,
        produces: config.produces,
        securityDefinitions: {
          apiKey: {
            type: 'apiKey',
            name: 'X-API-Key',
            in: 'header',
          },
        },
        security: [{ apiKey: [] }],
      },
    };

    await fastify.register(import('@fastify/swagger'), swaggerOptions);
  } catch (error) {
    console.error('Failed to register Swagger:', error);
    throw error;
  }
}

export async function registerSwaggerUI(
  fastify: FastifyInstance,
  routePrefix: string = '/docs'
): Promise<void> {
  try {
    const swaggerUiOptions: SwaggerUiOptions = {
      routePrefix,
      uiConfig: {
        docExpansion: 'list',
        deepLinking: false,
      },
      staticCSP: true,
      transformStaticCSP: (header) => header,
      transformSpecification: (swaggerObject) => {
        return swaggerObject;
      },
      transformSpecificationClone: true,
    };

    await fastify.register(import('@fastify/swagger-ui'), swaggerUiOptions);
  } catch (error) {
    console.error('Failed to register Swagger UI:', error);
    throw error;
  }
}

export async function setupSwagger(
  fastify: FastifyInstance,
  config?: SwaggerConfig,
  uiRoutePrefix?: string
): Promise<void> {
  try {
    await registerSwagger(fastify, config);
    await registerSwaggerUI(fastify, uiRoutePrefix);
    console.log('Swagger documentation setup complete');
  } catch (error) {
    console.error('Failed to setup Swagger:', error);
    throw error;
  }
}
