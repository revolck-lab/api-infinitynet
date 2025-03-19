import { Router } from 'express';
import { RouteFactory } from '../../../shared/utils/route.factory';
import userAdminController from '../controllers/UserAdminController';
import { apiKeyMiddleware } from '../../../shared/middlewares/auth.middleware';
import { 
  createUserAdminSchema, 
  updateUserAdminSchema, 
  getUserAdminByIdSchema, 
  listUserAdminSchema 
} from '../validations/user-admin.schema';
import { ErrorHandler } from '../../../shared/utils/error-handler';

// Cria um router específico para compatibilidade com API Key
const apiKeyRouter = Router();

// Configura as rotas com API Key
const apiKeyRoutes = new RouteFactory().createRoutes([
  {
    method: 'post',
    path: '/',
    handler: ErrorHandler.catchErrors(userAdminController.create),
    schema: createUserAdminSchema,
    middlewares: [apiKeyMiddleware]
  },
  {
    method: 'put',
    path: '/:id',
    handler: ErrorHandler.catchErrors(userAdminController.update),
    schema: updateUserAdminSchema,
    middlewares: [apiKeyMiddleware]
  },
  {
    method: 'delete',
    path: '/:id',
    handler: ErrorHandler.catchErrors(userAdminController.delete),
    schema: getUserAdminByIdSchema,
    middlewares: [apiKeyMiddleware]
  }
]);

// Registra as rotas de API Key
apiKeyRouter.use('/api-key', apiKeyRoutes);

// Configura as rotas principais
const userAdminRoutes = new RouteFactory().createRoutes([
  // Rotas públicas
  {
    method: 'get',
    path: '/',
    handler: ErrorHandler.catchErrors(userAdminController.getAll),
    schema: listUserAdminSchema
  },
  {
    method: 'get',
    path: '/:id',
    handler: ErrorHandler.catchErrors(userAdminController.getById),
    schema: getUserAdminByIdSchema
  },
  {
    method: 'get',
    path: '/email/:email',
    handler: ErrorHandler.catchErrors(userAdminController.getUserByEmail)
  },
  {
    method: 'get',
    path: '/cpf/:cpf',
    handler: ErrorHandler.catchErrors(userAdminController.getUserByCpf)
  },
  {
    method: 'get',
    path: '/telefone/:telefone',
    handler: ErrorHandler.catchErrors(userAdminController.getUserByTelefone)
  },
  
  // Rotas protegidas com autenticação e níveis de permissão
  {
    method: 'post',
    path: '/',
    handler: ErrorHandler.catchErrors(userAdminController.create),
    schema: createUserAdminSchema,
    auth: true,
    roleLevel: 100 // Apenas Administrador pode criar outro admin
  },
  {
    method: 'put',
    path: '/:id',
    handler: ErrorHandler.catchErrors(userAdminController.update),
    schema: updateUserAdminSchema,
    auth: true,
    roleLevel: 100 // Apenas Administrador
  },
  {
    method: 'delete',
    path: '/:id',
    handler: ErrorHandler.catchErrors(userAdminController.delete),
    schema: getUserAdminByIdSchema,
    auth: true,
    roleLevel: 100 // Apenas Administrador
  }
]);

// Cria o router final combinando as rotas
const router = Router();
router.use('/', userAdminRoutes);
router.use('/', apiKeyRouter);

export { router as userAdminRoutes };