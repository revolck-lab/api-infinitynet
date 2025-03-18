import { Router } from "express";
import authController from "../controllers/auth.controller";
import { validate } from "../../../shared/middlewares/validation.middleware";
import { loginSchema, refreshTokenSchema } from "../validations/auth.schema";

const authRoutes = Router();

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Realiza login na API
 *     tags: [Autenticação]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login realizado com sucesso
 *       401:
 *         description: Credenciais inválidas
 */
authRoutes.post("/login", validate(loginSchema), authController.login);

/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     summary: Atualiza o token de acesso
 *     tags: [Autenticação]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Token atualizado com sucesso
 *       401:
 *         description: Refresh token inválido ou expirado
 */
authRoutes.post(
  "/refresh",
  validate(refreshTokenSchema),
  authController.refreshToken
);

export { authRoutes };
