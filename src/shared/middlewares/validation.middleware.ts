import { Request, Response, NextFunction } from "express";
import { AnyZodObject, ZodError } from "zod";
import { AppError, ErrorType } from "../errors/AppError";

/**
 * Middleware para validar requisições com Zod schemas
 *
 * @param schema - O schema Zod para validação
 * @returns Middleware do Express que valida a requisição
 */
export const validate =
  (schema: AnyZodObject) =>
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Valida body, query e params numa única operação
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });

      return next();
    } catch (error) {
      if (error instanceof ZodError) {
        // Formata os erros de validação de forma mais amigável
        const formattedErrors = error.errors.map((err) => ({
          path: err.path.join("."),
          message: err.message,
        }));

        next(
          new AppError(
            "Erro de validação",
            ErrorType.VALIDATION,
            400,
            formattedErrors
          )
        );
      } else {
        next(error);
      }
    }
  };
