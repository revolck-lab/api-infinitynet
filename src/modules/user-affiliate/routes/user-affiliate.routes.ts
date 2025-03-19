import { Router } from 'express';
import { RouteFactory } from '../../../shared/utils/route.factory';
import userAffiliateController from '../controllers/UserAffiliateController';
import { apiKeyMiddleware } from '../../../shared/middlewares/auth.middleware';
import { 
  createUserAffiliateSchema, 
  updateUserAffiliateSchema, 
  getUserAffiliateByIdSchema, 
  listUserAffiliateSchema 
} from '../validations/user-affiliate.schema';
import { ErrorHandler } from '../../../shared/utils/error-handler';

// Cria um router específico para compatibilidade com API Key
const apiKeyRouter = Router();

// Configura as rotas com API Key
const apiKeyRoutes = new RouteFactory().createRoutes([
  {
    method: 'post',
    path: '/',
    handler: ErrorHandler.catchErrors(userAffiliateController.create),
    schema: createUserAffiliateSchema,
    middlewares: [apiKeyMiddleware]
  },
  {
    method: 'put',
    path: '/:id',
    handler: ErrorHandler.catchErrors(userAffiliateController.update),
    schema: updateUserAffiliateSchema,
    middlewares: [apiKeyMiddleware]
  },
  {
    method: 'delete',
    path: '/:id',
    handler: ErrorHandler.catchErrors(userAffiliateController.delete),
    schema: getUserAffiliateByIdSchema,
    middlewares: [apiKeyMiddleware]
  }
]);

// Registra as rotas de API Key
apiKeyRouter.use('/api-key', apiKeyRoutes);

// Configura as rotas principais
const userAffiliateRoutes = new RouteFactory().createRoutes([
  // Rotas públicas
  {
    method: 'get',
    path: '/',
    handler: ErrorHandler.catchErrors(userAffiliateController.getAll),
    schema: listUserAffiliateSchema
  },
  {
    method: 'get',
    path: '/:id',
    handler: ErrorHandler.catchErrors(userAffiliateController.getById),
    schema: getUserAffiliateByIdSchema
  },
  {
    method: 'get',
    path: '/email/:email',
    handler: ErrorHandler.catchErrors(userAffiliateController.getUserByEmail)
  },
  {
    method: 'get',
    path: '/cpf/:cpf',
    handler: ErrorHandler.catchErrors(userAffiliateController.getUserByCpf)
  },
  {
    method: 'get',
    path: '/telefone/:telefone',
    handler: ErrorHandler.catchErrors(userAffiliateController.getUserByTelefone)
  },
  
  // Rotas protegidas com autenticação e níveis de permissão
  {
    method: 'post',
    path: '/',
    handler: ErrorHandler.catchErrors(userAffiliateController.create),
    schema: createUserAffiliateSchema,
    auth: true,
    roleLevel: 50 // Nível de Gerente ou superior
  },
  {
    method: 'put',
    path: '/:id',
    handler: ErrorHandler.catchErrors(userAffiliateController.update),
    schema: updateUserAffiliateSchema,
    auth: true,
    roleLevel: 50 // Nível de Gerente ou superior
  },
  {
    method: 'delete',
    path: '/:id',
    handler: ErrorHandler.catchErrors(userAffiliateController.delete),
    schema: getUserAffiliateByIdSchema,
    auth: true,
    roleLevel: 100 // Apenas Administrador
  }
]);

// Cria o router final combinando as rotas
const router = Router();
router.use('/', userAffiliateRoutes);
router.use('/', apiKeyRouter);

export { router as userAffiliateRoutes };