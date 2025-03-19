import { Router } from 'express';
import { RouteFactory } from '../../../shared/utils/route.factory';
import userController from '../controllers/UserController';
import { apiKeyMiddleware } from '../../../shared/middlewares/auth.middleware';
import { 
  createUserSchema, 
  updateUserSchema, 
  getUserByIdSchema, 
  listUsersSchema 
} from '../validations/user.schema';
import { ErrorHandler } from '../../../shared/utils/error-handler';

// Cria um router específico para compatibilidade com API Key
const apiKeyRouter = Router();

// Configura as rotas com API Key
const apiKeyRoutes = new RouteFactory().createRoutes([
  {
    method: 'post',
    path: '/',
    handler: ErrorHandler.catchErrors(userController.create),
    schema: createUserSchema,
    middlewares: [apiKeyMiddleware]
  },
  {
    method: 'put',
    path: '/:id',
    handler: ErrorHandler.catchErrors(userController.update),
    schema: updateUserSchema,
    middlewares: [apiKeyMiddleware]
  },
  {
    method: 'delete',
    path: '/:id',
    handler: ErrorHandler.catchErrors(userController.delete),
    schema: getUserByIdSchema,
    middlewares: [apiKeyMiddleware]
  }
]);

// Registra as rotas de API Key
apiKeyRouter.use('/api-key', apiKeyRoutes);

// Configura as rotas principais
const userRoutes = new RouteFactory().createRoutes([
  // Rotas públicas
  {
    method: 'get',
    path: '/',
    handler: ErrorHandler.catchErrors(userController.getAll),
    schema: listUsersSchema
  },
  {
    method: 'get',
    path: '/:id',
    handler: ErrorHandler.catchErrors(userController.getById),
    schema: getUserByIdSchema
  },
  {
    method: 'get',
    path: '/email/:email',
    handler: ErrorHandler.catchErrors(userController.getUserByEmail)
  },
  {
    method: 'get',
    path: '/cpf/:cpf',
    handler: ErrorHandler.catchErrors(userController.getUserByCpf)
  },
  
  // Rotas protegidas com autenticação e níveis de permissão
  {
    method: 'post',
    path: '/',
    handler: ErrorHandler.catchErrors(userController.create),
    schema: createUserSchema,
    auth: true,
    roleLevel: 50 // Nível de Gerente ou superior
  },
  {
    method: 'put',
    path: '/:id',
    handler: ErrorHandler.catchErrors(userController.update),
    schema: updateUserSchema,
    auth: true,
    roleLevel: 50 // Nível de Gerente ou superior
  },
  {
    method: 'delete',
    path: '/:id',
    handler: ErrorHandler.catchErrors(userController.delete),
    schema: getUserByIdSchema,
    auth: true,
    roleLevel: 100 // Apenas Administrador
  }
]);

// Cria o router final combinando as rotas
const router = Router();
router.use('/', userRoutes);
router.use('/', apiKeyRouter);

export { router as userRoutes };