import { z } from "zod";

/**
 * Schema para criação de perfil
 */
export const createRoleSchema = z.object({
  body: z.object({
    name: z
      .string()
      .min(2, "Nome deve ter pelo menos 2 caracteres")
      .max(50, "Nome deve ter no máximo 50 caracteres"),
    level: z
      .number()
      .int("Nível deve ser um número inteiro")
      .min(1, "Nível deve ser no mínimo 1")
      .max(100, "Nível deve ser no máximo 100"),
    status: z
      .number()
      .int("Status deve ser um número inteiro")
      .min(0, "Status deve ser 0 ou 1")
      .max(1, "Status deve ser 0 ou 1"),
  }),
});

/**
 * Schema para atualização de perfil
 */
export const updateRoleSchema = z.object({
  params: z.object({
    id: z.string().uuid("ID de perfil inválido"),
  }),
  body: z
    .object({
      name: z
        .string()
        .min(2, "Nome deve ter pelo menos 2 caracteres")
        .max(50, "Nome deve ter no máximo 50 caracteres")
        .optional(),
      level: z
        .number()
        .int("Nível deve ser um número inteiro")
        .min(1, "Nível deve ser no mínimo 1")
        .max(100, "Nível deve ser no máximo 100")
        .optional(),
      status: z
        .number()
        .int("Status deve ser um número inteiro")
        .min(0, "Status deve ser 0 ou 1")
        .max(1, "Status deve ser 0 ou 1")
        .optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: "É necessário fornecer pelo menos um campo para atualização",
    }),
});

/**
 * Schema para obtenção de perfil por ID
 */
export const getRoleByIdSchema = z.object({
  params: z.object({
    id: z.string().uuid("ID de perfil inválido"),
  }),
});

/**
 * Schema para listagem de perfis com paginação
 */
export const listRolesSchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/, "Página deve ser um número").optional(),
    limit: z.string().regex(/^\d+$/, "Limite deve ser um número").optional(),
  }),
});
