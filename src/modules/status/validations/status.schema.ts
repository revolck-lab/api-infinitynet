import { z } from "zod";

/**
 * Schema para criação de status
 */
export const createStatusSchema = z.object({
  body: z.object({
    name: z
      .string()
      .min(2, "Nome deve ter pelo menos 2 caracteres")
      .max(50, "Nome deve ter no máximo 50 caracteres"),
  }),
});

/**
 * Schema para atualização de status
 */
export const updateStatusSchema = z.object({
  params: z.object({
    id: z.string().uuid("ID de status inválido"),
  }),
  body: z.object({
    name: z
      .string()
      .min(2, "Nome deve ter pelo menos 2 caracteres")
      .max(50, "Nome deve ter no máximo 50 caracteres"),
  }),
});

/**
 * Schema para obtenção de status por ID
 */
export const getStatusByIdSchema = z.object({
  params: z.object({
    id: z.string().uuid("ID de status inválido"),
  }),
});

/**
 * Schema para listagem de status com paginação
 */
export const listStatusesSchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/, "Página deve ser um número").optional(),
    limit: z.string().regex(/^\d+$/, "Limite deve ser um número").optional(),
  }),
});
