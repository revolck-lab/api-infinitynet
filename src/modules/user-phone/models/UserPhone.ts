// src/modules/user-phone/models/UserPhone.ts
import { Role } from '../../role/models/Role';
import { Status } from '../../status/models/Status';

/**
 * Interface para representar um usuário de aplicativo móvel
 */
export interface UserPhone {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  cpf: string;
  endereco: string;
  avatar?: string | null;
  cidade: string;
  estado: string;
  pin: string; // PIN numérico para acesso no app móvel
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
 * Interface para criação de um novo usuário de app móvel
 */
export interface CreateUserPhoneDTO {
  nome: string;
  email: string;
  telefone: string;
  cpf: string;
  endereco: string;
  avatar?: string;
  cidade: string;
  estado: string;
  pin: string;
  roleId: string;
  statusId: string;
}

/**
 * Interface para atualização de usuário de app móvel
 */
export interface UpdateUserPhoneDTO {
  nome?: string;
  email?: string;
  telefone?: string;
  cpf?: string;
  endereco?: string;
  avatar?: string;
  cidade?: string;
  estado?: string;
  pin?: string;
  roleId?: string;
  statusId?: string;
  lastLoginAt?: Date;
  failedAttempts?: number;
}

/**
 * Interface para login de usuário de app móvel
 */
export interface UserPhoneLoginDTO {
  telefone: string;
  pin: string;
}

/**
 * Interface para resposta de listagem com paginação
 */
export interface UserPhoneListResponse {
  data: UserPhone[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}