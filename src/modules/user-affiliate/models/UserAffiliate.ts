import { Role } from '../../role/models/Role';
import { Status } from '../../status/models/Status';

/**
 * Interface para representar um usuário afiliado
 */
export interface UserAffiliate {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  cpf: string;
  endereco: string;
  avatar?: string | null;
  cidade: string;
  estado: string;
  senha: string;
  roleId: string;
  statusId: string;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date | null;
  failedAttempts: number;
  role?: Role;
  status?: Status;
}

/**
 * Interface para criação de um novo usuário afiliado
 */
export interface CreateUserAffiliateDTO {
  nome: string;
  email: string;
  telefone: string;
  cpf: string;
  endereco: string;
  avatar?: string;
  cidade: string;
  estado: string;
  senha: string;
  roleId: string;
  statusId: string;
}

/**
 * Interface para atualização de usuário afiliado
 */
export interface UpdateUserAffiliateDTO {
  nome?: string;
  email?: string;
  telefone?: string;
  cpf?: string;
  endereco?: string;
  avatar?: string;
  cidade?: string;
  estado?: string;
  senha?: string;
  roleId?: string;
  statusId?: string;
  lastLoginAt?: Date;
  failedAttempts?: number;
}

/**
 * Interface para login de usuário afiliado
 */
export interface UserAffiliateLoginDTO {
  cpf: string;
  senha: string;
}

/**
 * Interface para resposta de listagem com paginação
 */
export interface UserAffiliateListResponse {
  data: UserAffiliate[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}