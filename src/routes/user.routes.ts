import { Router } from "express";
import userController from "../controllers/UserController";
import { validate } from "../../../shared/middlewares/validation.middleware";
import {
  jwtMiddleware,
  requireRole,
  apiKeyMiddleware,
} from "../../../shared/middlewares/jwt.middleware";
import {
  createUserSchema,
  updateUserSchema,
  getUserByIdSchema,
  listUsersSchema,
} from "../validations/user.schema";

const userRoutes = Router();

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Lista todos os usuários
 *     tags: [Usuários]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Número da página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Limite de itens por página
 *     responses:
 *       200:
 *         description: Lista de usuários retornada com sucesso
 */
userRoutes.get("/", validate(listUsersSchema), userController.getAllUsers);

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Obtém um usuário pelo ID
 *     tags: [Usuários]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do usuário
 *     responses:
 *       200:
 *         description: Usuário encontrado com sucesso
 *       404:
 *         description: Usuário não encontrado
 */
userRoutes.get("/:id", validate(getUserByIdSchema), userController.getUserById);

/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: Cria um novo usuário
 *     tags: [Usuários]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateUserRequest'
 *     responses:
 *       201:
 *         description: Usuário criado com sucesso
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Não autorizado
 */
userRoutes.post(
  "/",
  // Suporta tanto a nova autenticação JWT quanto a antiga por API Key
  [jwtMiddleware, requireRole(50)],
  validate(createUserSchema),
  userController.createUser
);

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: Atualiza um usuário existente
 *     tags: [Usuários]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do usuário
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateUserRequest'
 *     responses:
 *       200:
 *         description: Usuário atualizado com sucesso
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Não autorizado
 *       404:
 *         description: Usuário não encontrado
 */
userRoutes.put(
  "/:id",
  // Suporta tanto a nova autenticação JWT quanto a antiga por API Key
  [jwtMiddleware, requireRole(50)],
  validate(updateUserSchema),
  userController.updateUser
);

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Remove um usuário
 *     tags: [Usuários]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do usuário
 *     responses:
 *       204:
 *         description: Usuário removido com sucesso
 *       401:
 *         description: Não autorizado
 *       404:
 *         description: Usuário não encontrado
 */
userRoutes.delete(
  "/:id",
  // Suporta tanto a nova autenticação JWT quanto a antiga por API Key
  [jwtMiddleware, requireRole(100)],
  validate(getUserByIdSchema),
  userController.deleteUser
);

// API Key routes (para compatibilidade)
userRoutes.post(
  "/api-key",
  apiKeyMiddleware,
  validate(createUserSchema),
  userController.createUser
);
userRoutes.put(
  "/api-key/:id",
  apiKeyMiddleware,
  validate(updateUserSchema),
  userController.updateUser
);
userRoutes.delete(
  "/api-key/:id",
  apiKeyMiddleware,
  validate(getUserByIdSchema),
  userController.deleteUser
);

export { userRoutes };
