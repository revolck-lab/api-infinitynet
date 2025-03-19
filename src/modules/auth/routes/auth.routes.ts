import { Router } from "express";
import authController from "../controllers/auth.controller";
import { validate } from "../../../shared/middlewares/validation.middleware";
import { 
  refreshTokenSchema 
} from "../validations/auth.schema";

// Importando esquemas de validação para diferentes tipos de usuários
import { 
  loginUserPhoneSchema 
} from "../../user-phone/validations/user-phone.schema";

import { 
  loginUserAdminSchema 
} from "../../user-admin/validations/user-admin.schema";

import { 
  loginUserAffiliateSchema 
} from "../../user-affiliate/validations/user-affiliate.schema";

const authRoutes = Router();

/**
 * @swagger
 * /auth/login/phone:
 *   post:
 *     summary: Autenticar usuário de app
 *     description: Realiza a autenticação de um usuário de app via telefone e PIN
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginPhoneRequest'
 *     responses:
 *       200:
 *         description: Autenticação realizada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         description: Credenciais inválidas
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 message:
 *                   type: string
 *                   example: Credenciais inválidas
 *       429:
 *         $ref: '#/components/responses/TooManyRequestsError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
authRoutes.post(
  "/login/phone", 
  validate(loginUserPhoneSchema), 
  authController.loginPhone
);

/**
 * @swagger
 * /auth/login/admin:
 *   post:
 *     summary: Autenticar usuário administrativo
 *     description: Realiza a autenticação de um usuário administrativo via CPF e senha
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginCpfRequest'
 *     responses:
 *       200:
 *         description: Autenticação realizada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         description: Credenciais inválidas
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 message:
 *                   type: string
 *                   example: Credenciais inválidas
 *       429:
 *         $ref: '#/components/responses/TooManyRequestsError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
authRoutes.post(
  "/login/admin", 
  validate(loginUserAdminSchema), 
  authController.loginAdmin
);

/**
 * @swagger
 * /auth/login/affiliate:
 *   post:
 *     summary: Autenticar usuário afiliado
 *     description: Realiza a autenticação de um usuário afiliado via CPF e senha
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginCpfRequest'
 *     responses:
 *       200:
 *         description: Autenticação realizada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         description: Credenciais inválidas
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 message:
 *                   type: string
 *                   example: Credenciais inválidas
 *       429:
 *         $ref: '#/components/responses/TooManyRequestsError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
authRoutes.post(
  "/login/affiliate", 
  validate(loginUserAffiliateSchema), 
  authController.loginAffiliate
);

/**
 * @swagger
 * /auth/refresh:
 *   post:
 *     summary: Atualizar token de acesso
 *     description: Utiliza um refresh token válido para obter um novo token de acesso
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RefreshTokenRequest'
 *     responses:
 *       200:
 *         description: Token atualizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RefreshTokenResponse'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         description: Refresh token inválido ou expirado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 message:
 *                   type: string
 *                   example: Refresh token inválido ou expirado
 *       429:
 *         $ref: '#/components/responses/TooManyRequestsError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
authRoutes.post(
  "/refresh",
  validate(refreshTokenSchema),
  authController.refreshToken
);

export { authRoutes };