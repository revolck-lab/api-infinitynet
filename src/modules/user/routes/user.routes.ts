import { Router } from 'express';
import userController from '../controllers/UserController';
import { validate } from '../../../shared/middlewares/validation.middleware';
import { jwtMiddleware, requireRole, apiKeyMiddleware } from '../../../shared/middlewares/jwt.middleware';
import { 
  createUserSchema, 
  updateUserSchema, 
  getUserByIdSchema, 
  listUsersSchema 
} from '../validations/user.schema';

const userRoutes = Router();

// Rotas públicas
userRoutes.get('/', validate(listUsersSchema), userController.getAllUsers);
userRoutes.get('/:id', validate(getUserByIdSchema), userController.getUserById);

// Rotas protegidas por autenticação JWT
userRoutes.post('/', [jwtMiddleware, requireRole(50)], validate(createUserSchema), userController.createUser);
userRoutes.put('/:id', [jwtMiddleware, requireRole(50)], validate(updateUserSchema), userController.updateUser);
userRoutes.delete('/:id', [jwtMiddleware, requireRole(100)], validate(getUserByIdSchema), userController.deleteUser);

// Rotas com autenticação por API Key (compatibilidade)
userRoutes.post('/api-key', apiKeyMiddleware, validate(createUserSchema), userController.createUser);
userRoutes.put('/api-key/:id', apiKeyMiddleware, validate(updateUserSchema), userController.updateUser);
userRoutes.delete('/api-key/:id', apiKeyMiddleware, validate(getUserByIdSchema), userController.deleteUser);

export { userRoutes };