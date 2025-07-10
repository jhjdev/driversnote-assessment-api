import { FastifySchema } from 'fastify';

// Extend FastifySchema to include Swagger-specific properties
export interface SwaggerSchema extends FastifySchema {
  tags?: string[];
  description?: string;
  summary?: string;
  security?: Array<Record<string, string[]>>;
  operationId?: string;
  deprecated?: boolean;
  produces?: string[];
  consumes?: string[];
}

// Helper type for route schemas with Swagger support
export type RouteSchema = SwaggerSchema;
