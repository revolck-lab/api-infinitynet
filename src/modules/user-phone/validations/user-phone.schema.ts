import { z } from "zod";

/**
 * Regex para validação de CPF
 */
const cpfRegex = /^\d{3}\.\d{3}\.\d{3}-\d{2}$|^\d{11}$/;

/**
 * Regex para validação de telefone
 * Aceita formatos como: (11) 98765-4321 ou 11987654321
 */
const phoneRegex = /^\(\d{2}\)\s\d{4,5}-\d{4}$|^\d{10,11}$/;

/**
 * Regex para validação de PIN (apenas números)
 */
const pinRegex = /^\d{4,6}$/;

/**
 * Schema base para dados do usuário de app
 */
const userPhoneBase = {
  nome: z
    .string()
    .min(3, "Nome deve ter pelo menos 3 caracteres")
    .max(100, "Nome deve ter no máximo 100 caracteres"),

  email: z.string().email("E-mail inválido"),

  cpf: z
    .string()
    .regex(
      cpfRegex,
      "CPF inválido. Use o formato 123.456.789-00 ou 12345678900"
    ),

  telefone: z
    .string()
    .regex(
      phoneRegex,
      "Telefone inválido. Use o formato (11) 98765-4321 ou 11987654321"
    ),

  endereco: z
    .string()
    .min(5, "Endereço deve ter pelo menos 5 caracteres")
    .max(200, "Endereço deve ter no máximo 200 caracteres"),

  cidade: z.string().min(2, "Cidade deve ter pelo menos 2 caracteres"),

  estado: z.string().length(2, "Estado deve ser a sigla com 2 letras"),

  roleId: z.string().uuid("ID do perfil inválido"),

  statusId: z.string().uuid("ID do status inválido"),
};

/**
 * Schema para criação de usuário de app
 */
export const createUserPhoneSchema = z.object({
  body: z.object({
    ...userPhoneBase,
    pin: z
      .string()
      .regex(pinRegex, "PIN deve ter entre 4 e 6 dígitos numéricos"),
    avatar: z.string().url("URL do avatar inválida").optional(),
  }),
});

/**
 * Schema para login de usuário de app (telefone + PIN)
 */
export const loginUserPhoneSchema = z.object({
  body: z.object({
    telefone: z
      .string()
      .regex(
        phoneRegex,
        "Telefone inválido. Use o formato (11) 98765-4321 ou 11987654321"
      ),
    pin: z
      .string()
      .regex(pinRegex, "PIN deve ter entre 4 e 6 dígitos numéricos"),
  }),
});

/**
 * Schema para atualização de usuário de app
 */
export const updateUserPhoneSchema = z.object({
  params: z.object({
    id: z.string().uuid("ID de usuário inválido"),
  }),
  body: z
    .object({
      nome: userPhoneBase.nome.optional(),
      email: userPhoneBase.email.optional(),
      cpf: userPhoneBase.cpf.optional(),
      telefone: userPhoneBase.telefone.optional(),
      endereco: userPhoneBase.endereco.optional(),
      cidade: userPhoneBase.cidade.optional(),
      estado: userPhoneBase.estado.optional(),
      roleId: userPhoneBase.roleId.optional(),
      statusId: userPhoneBase.statusId.optional(),
      pin: z
        .string()
        .regex(pinRegex, "PIN deve ter entre 4 e 6 dígitos numéricos")
        .optional(),
      avatar: z.string().url("URL do avatar inválida").optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: "É necessário fornecer pelo menos um campo para atualização",
    }),
});

/**
 * Schema para obtenção de usuário por ID
 */
export const getUserPhoneByIdSchema = z.object({
  params: z.object({
    id: z.string().uuid("ID de usuário inválido"),
  }),
});

/**
 * Schema para listagem de usuários com paginação
 */
export const listUserPhoneSchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/, "Página deve ser um número").optional(),
    limit: z.string().regex(/^\d+$/, "Limite deve ser um número").optional(),
    nome: z.string().optional(),
    email: z.string().optional(),
    telefone: z.string().optional(),
    cpf: z.string().optional(),
    cidade: z.string().optional(),
    estado: z.string().optional(),
    roleId: z.string().optional(),
    statusId: z.string().optional(),
  }),
});