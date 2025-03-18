// Interface para representar um status
export interface Status {
  id: string;
  name: string;
}

// Interface para criar um novo status
export interface CreateStatusDTO {
  name: string;
}

// Interface para atualizar um status
export interface UpdateStatusDTO {
  name?: string;
}

// Interface para resposta de listagem com paginação
export interface StatusListResponse {
  statuses: Status[];
  total: number;
  page: number;
  limit: number;
}
