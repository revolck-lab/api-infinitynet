import { Request, Response, NextFunction } from "express";
import { AppError } from "../errors/AppError";

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const apiKey = req.headers["x-api-key"];

  // Verifica se a chave API está presente e é válida
  // Em produção, você compararia com uma chave armazenada de forma segura
  if (!apiKey || apiKey !== process.env.API_KEY) {
    throw new AppError("Acesso não autorizado. API Key inválida.", 401);
  }

  next();
};
