import swaggerJSDoc from 'swagger-jsdoc';
import { version } from '../../../package.json';

const swaggerOptions: swaggerJSDoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'InfinityNet API',
      version,
      description: 'API REST para gerenciamento de usuários e autenticação',
      contact: {
        name: 'InfinityNet Team',
        url: 'https://infinitynet.com.br',
        email: 'api@infinitynet.com.br'
      },
      license: {
        name: 'ISC',
        url: 'https://opensource.org/licenses/ISC'
      }
    },
    servers: [
      {
        url: '/api',
        description: 'Servidor principal'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        },
        apiKeyAuth: {
          type: 'apiKey',
          in: 'header',
          name: 'x-api-key'
        }
      }
    }
  },
  apis: [
    './src/routes.ts',
    './src/modules/*/routes/*.ts',
    './src/modules/*/models/*.ts',
    './src/modules/*/controllers/*.ts'
  ]
};

export const swaggerSpec = swaggerJSDoc(swaggerOptions);