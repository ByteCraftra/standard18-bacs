import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Standard18 BACS Validator API',
      version: '0.1.0',
      description: 'REST API for validating and processing UK BACS Standard 18 files',
    },
    servers: [{ url: '/api/v1' }],
  },
  apis: ['./src/routes/*.ts'], // paths to route files with JSDoc comments
};

const swaggerSpec = swaggerJsdoc(options);

export function setupSwagger(app: Express) {
  app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}