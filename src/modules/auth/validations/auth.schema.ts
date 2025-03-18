import { z } from "zod";

/**
 * Schema para validação do login
 */
export const loginSchema = z.object({
  body: z.object({
    email: z.string().email("Email inválido"),
    password: z.string().min(1, "Senha é obrigatória"),
  }),
});

/**
 * Schema para validação do refresh token
 */
export const refreshTokenSchema = z.object({
  body: z.object({
    refreshToken: z.string().min(1, "Refresh token é obrigatório"),
  }),
});
