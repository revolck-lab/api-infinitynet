import { Request, Response } from "express";
import { AppError } from "../../../shared/errors/AppError";
import authService from "../services/auth.service";

/**
 * Controlador para operações de autenticação
 */
class AuthController {
  /**
   * Realiza o login do usuário
   */
  public async login(req: Request, res: Response): Promise<Response> {
    const { email, password } = req.body;

    if (!email || !password) {
      throw AppError.validation("Email e senha são obrigatórios");
    }

    const authResponse = await authService.login(email, password);

    return res.status(200).json({
      status: "success",
      data: authResponse,
    });
  }

  /**
   * Atualiza o token de acesso usando o refresh token
   */
  public async refreshToken(req: Request, res: Response): Promise<Response> {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      throw AppError.validation("Refresh token é obrigatório");
    }

    const tokenResponse = await authService.refreshToken(refreshToken);

    return res.status(200).json({
      status: "success",
      data: tokenResponse,
    });
  }
}

export default new AuthController();
