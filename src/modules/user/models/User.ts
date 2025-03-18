import { Role } from '../../role/models/Role';
import { Status } from '../../status/models/Status';

/**
 * Interface para representar um usuário completo
 */
export interface User {
  id: string;
  cpf: string;
  nome: string;
  telefone: string;
  email: string;
  senha: string;
  avatar?: string | null;
  cidade: string;
  estado: string;
  roleId: string;
  statusId: string;
  createdAt: Date;
  updatedAt: Date;
  role?: Role;
  status?: Status;
}

/**
 * Interface para criação de um novo usuário
 */
export interface CreateUserDTO {
  cpf: string;
  nome: string;
  telefone: string;
  email: string;
  senha: string;
  avatar?: string;
  cidade: string;
  estado: string;
  roleId: string;
  statusId: string;
}

/**
 * Interface para atualização de usuário (campos opcionais)
 */
export interface UpdateUserDTO {
  cpf?: string;
  nome?: string;
  telefone?: string;
  email?: string;
  senha?: string;
  avatar?: string;
  cidade?: string;
  estado?: string;
  roleId?: string;
  statusId?: string;
}

/**
 * Interface para resposta de listagem com paginação
 */
export interface UserListResponse {
  users: User[];
  total: number;
  page: number;
  limit: number;
}