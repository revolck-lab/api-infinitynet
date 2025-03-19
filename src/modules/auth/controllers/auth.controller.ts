import { Request, Response } from "express";
import { AppError } from "../../../shared/errors/AppError";
import authService from "../services/auth.service";

/**
 * Controlador para operações de autenticação
 */
class AuthController {
  /**
   * Realiza o login do usuário de app (phone + PIN)
   */
  public async loginPhone(req: Request, res: Response): Promise<Response> {
    const { telefone, pin } = req.body;

    if (!telefone || !pin) {
      throw AppError.validation("Telefone e PIN são obrigatórios");
    }

    const authResponse = await authService.loginByPhone(telefone, pin);

    return res.status(200).json({
      status: "success",
      data: authResponse,
    });
  }

  /**
   * Realiza o login do usuário administrativo (CPF + senha)
   */
  public async loginAdmin(req: Request, res: Response): Promise<Response> {
    const { cpf, senha } = req.body;

    if (!cpf || !senha) {
      throw AppError.validation("CPF e senha são obrigatórios");
    }

    const authResponse = await authService.loginAdmin(cpf, senha);

    return res.status(200).json({
      status: "success",
      data: authResponse,
    });
  }

  /**
   * Realiza o login do usuário afiliado (CPF + senha)
   */
  public async loginAffiliate(req: Request, res: Response): Promise<Response> {
    const { cpf, senha } = req.body;

    if (!cpf || !senha) {
      throw AppError.validation("CPF e senha são obrigatórios");
    }

    const authResponse = await authService.loginAffiliate(cpf, senha);

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