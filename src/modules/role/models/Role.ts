// Interface para representar um perfil (role)
export interface Role {
  id: string;
  name: string;
  level: number;
  status: number; // 1 = ativo, 0 = inativo
}

// Interface para criar um novo perfil
export interface CreateRoleDTO {
  name: string;
  level: number;
  status: number;
}

// Interface para atualizar um perfil
export interface UpdateRoleDTO {
  name?: string;
  level?: number;
  status?: number;
}

// Interface para resposta de listagem com paginação
export interface RoleListResponse {
  roles: Role[];
  total: number;
  page: number;
  limit: number;
}
