import { Router } from 'express';
import { RouteFactory } from '../../../shared/utils/route.factory';
import userPhoneController from '../controllers/UserPhoneController';
import { apiKeyMiddleware } from '../../../shared/middlewares/auth.middleware';
import { 
  createUserPhoneSchema, 
  updateUserPhoneSchema, 
  getUserPhoneByIdSchema, 
  listUserPhoneSchema 
} from '../validations/user-phone.schema';
import { ErrorHandler } from '../../../shared/utils/error-handler';

// Cria um router específico para compatibilidade com API Key
const apiKeyRouter = Router();

// Configura as rotas com API Key
const apiKeyRoutes = new RouteFactory().createRoutes([
  {
    method: 'post',
    path: '/',
    handler: ErrorHandler.catchErrors(userPhoneController.create),
    schema: createUserPhoneSchema,
    middlewares: [apiKeyMiddleware]
  },
  {
    method: 'put',
    path: '/:id',
    handler: ErrorHandler.catchErrors(userPhoneController.update),
    schema: updateUserPhoneSchema,
    middlewares: [apiKeyMiddleware]
  },
  {
    method: 'delete',
    path: '/:id',
    handler: ErrorHandler.catchErrors(userPhoneController.delete),
    schema: getUserPhoneByIdSchema,
    middlewares: [apiKeyMiddleware]
  }
]);

// Registra as rotas de API Key
apiKeyRouter.use('/api-key', apiKeyRoutes);

// Configura as rotas principais
const userPhoneRoutes = new RouteFactory().createRoutes([
  // Rotas públicas
  {
    method: 'get',
    path: '/',
    handler: ErrorHandler.catchErrors(userPhoneController.getAll),
    schema: listUserPhoneSchema
  },
  {
    method: 'get',
    path: '/:id',
    handler: ErrorHandler.catchErrors(userPhoneController.getById),
    schema: getUserPhoneByIdSchema
  },
  {
    method: 'get',
    path: '/telefone/:telefone',
    handler: ErrorHandler.catchErrors(userPhoneController.getUserByTelefone)
  },
  {
    method: 'get',
    path: '/email/:email',
    handler: ErrorHandler.catchErrors(userPhoneController.getUserByEmail)
  },
  {
    method: 'get',
    path: '/cpf/:cpf',
    handler: ErrorHandler.catchErrors(userPhoneController.getUserByCpf)
  },
  
  // Rotas protegidas com autenticação e níveis de permissão
  {
    method: 'post',
    path: '/',
    handler: ErrorHandler.catchErrors(userPhoneController.create),
    schema: createUserPhoneSchema,
    auth: true,
    roleLevel: 50 // Nível de Gerente ou superior
  },
  {
    method: 'put',
    path: '/:id',
    handler: ErrorHandler.catchErrors(userPhoneController.update),
    schema: updateUserPhoneSchema,
    auth: true,
    roleLevel: 50 // Nível de Gerente ou superior
  },
  {
    method: 'delete',
    path: '/:id',
    handler: ErrorHandler.catchErrors(userPhoneController.delete),
    schema: getUserPhoneByIdSchema,
    auth: true,
    roleLevel: 100 // Apenas Administrador
  }
]);

// Cria o router final combinando as rotas
const router = Router();
router.use('/', userPhoneRoutes);
router.use('/', apiKeyRouter);

export { router as userPhoneRoutes };