import { Router } from 'express';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from '../swagger/swagger.config';

/**
 * Configura o Swagger para a aplicação
 * @param router Router do Express no qual serão registradas as rotas do Swagger
 */
export const setupSwagger = (router: Router): void => {
  // Rota para servir a documentação do Swagger
  router.use('/api-docs', swaggerUi.serve);
  router.get('/api-docs', swaggerUi.setup(swaggerSpec, {
    explorer: true,
    swaggerOptions: {
      persistAuthorization: true,
      docExpansion: 'none',
      filter: true,
      showRequestDuration: true
    },
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'InfinityNet API - Documentação'
  }));

  // Rota para obter o JSON do Swagger diretamente
  router.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });
};