import { Role } from '../../role/models/Role';
import { Status } from '../../status/models/Status';

/**
 * Interface para representar um usuário administrativo
 */
export interface UserAdmin {
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
 * Interface para criação de um novo usuário administrativo
 */
export interface CreateUserAdminDTO {
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
 * Interface para atualização de usuário administrativo
 */
export interface UpdateUserAdminDTO {
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
 * Interface para login de usuário administrativo
 */
export interface UserAdminLoginDTO {
  cpf: string;
  senha: string;
}

/**
 * Interface para resposta de listagem com paginação
 */
export interface UserAdminListResponse {
  data: UserAdmin[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}