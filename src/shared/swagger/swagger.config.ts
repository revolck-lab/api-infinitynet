// src/shared/swagger/swagger.config.ts
import swaggerJSDoc from 'swagger-jsdoc';
import { version } from '../../../package.json';
import { config } from '../../config';

// Informações básicas da API
const apiInfo = {
  title: 'InfinityNet API',
  version,
  description: `API REST moderna para gerenciamento de usuários com arquitetura modular e microserviços.
  
  ## Características
  
  - ✅ Arquitetura modular inspirada em microserviços
  - ✅ Autenticação JWT com refresh tokens
  - ✅ Validação de dados com Zod
  - ✅ Tratamento centralizado de erros
  - ✅ Logs estruturados
  - ✅ Controle de acesso baseado em perfis (RBAC)
  
  ## Autenticação
  
  Esta API suporta dois métodos de autenticação:
  
  1. **JWT (recomendado)**: Use o endpoint \`/api/auth/login\` para obter um token JWT.
  2. **API Key (legado)**: Inclua o cabeçalho \`x-api-key\` nas requisições.
  `,
  contact: {
    name: 'InfinityNet Tech Team',
    url: 'https://infinitynet.com.br',
    email: 'api@infinitynet.com.br'
  },
  license: {
    name: 'ISC',
    url: 'https://opensource.org/licenses/ISC'
  }
};

// Ambientes disponíveis
const servers = [
  {
    url: '/api',
    description: 'Servidor atual'
  }
];

// Adiciona ambientes adicionais em desenvolvimento
if (config.server.isDev) {
  servers.push(
    {
      url: 'http://localhost:3000/api',
      description: 'Servidor de desenvolvimento local'
    },
    {
      url: 'https://api-dev.infinitynet.com.br/api',
      description: 'Servidor de homologação'
    }
  );
}

// Tags para agrupar os endpoints
const tags = [
  { 
    name: 'Auth', 
    description: 'Operações de autenticação e autorização',
    externalDocs: {
      description: 'Saiba mais sobre autenticação',
      url: 'https://docs.infinitynet.com.br/auth'
    }
  },
  { 
    name: 'Users', 
    description: 'Gerenciamento de usuários',
    externalDocs: {
      description: 'Guia detalhado de usuários',
      url: 'https://docs.infinitynet.com.br/users'
    }
  },
  { 
    name: 'Roles', 
    description: 'Gerenciamento de perfis e níveis de acesso' 
  },
  { 
    name: 'Status', 
    description: 'Gerenciamento de estados de usuários' 
  },
  { 
    name: 'System', 
    description: 'Operações do sistema e diagnóstico' 
  }
];

// Segurança
const securitySchemes = {
  bearerAuth: {
    type: 'http',
    scheme: 'bearer',
    bearerFormat: 'JWT',
    description: `Autenticação JWT (recomendada).
    
    Para obter um token JWT, use o endpoint \`/api/auth/login\`.
    
    Exemplo de uso: \`Authorization: Bearer eyJhbGciOiJIUzI1...\``
  },
  apiKeyAuth: {
    type: 'apiKey',
    in: 'header',
    name: 'x-api-key',
    description: `API Key para compatibilidade com sistemas legados.
    
    Será descontinuada em futuras versões - migre para JWT.
    
    Exemplo de uso: \`x-api-key: your_api_key_here\``
  }
};

// Configuração completa do Swagger
const swaggerOptions: swaggerJSDoc.Options = {
  definition: {
    openapi: '3.0.3',
    info: apiInfo,
    servers,
    tags,
    components: {
      securitySchemes,
      schemas: {
        Error: {
          type: 'object',
          properties: {
            status: { type: 'string', example: 'error' },
            message: { type: 'string', example: 'Mensagem de erro' },
            type: { type: 'string', example: 'VALIDATION_ERROR' },
            details: { type: 'array', items: { type: 'object' } },
            timestamp: { type: 'string', format: 'date-time' },
            requestId: { type: 'string', example: 'abc123' }
          }
        },
        HealthCheck: {
          type: 'object',
          properties: {
            status: { type: 'string', example: 'success' },
            message: { type: 'string', example: 'API está funcionando corretamente' },
            version: { type: 'string', example: '1.0.0' },
            environment: { type: 'string', example: 'production' },
            timestamp: { type: 'string', format: 'date-time' },
            uptime: { type: 'number', example: 3600 }
          }
        },
        // Modelos de autenticação
        LoginRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', format: 'email', example: 'usuario@exemplo.com' },
            password: { type: 'string', format: 'password', example: 'senha123' }
          }
        },
        LoginResponse: {
          type: 'object',
          properties: {
            status: { type: 'string', example: 'success' },
            data: {
              type: 'object',
              properties: {
                user: {
                  type: 'object',
                  properties: {
                    id: { type: 'string', format: 'uuid' },
                    nome: { type: 'string' },
                    email: { type: 'string', format: 'email' },
                    role: {
                      type: 'object',
                      properties: {
                        id: { type: 'string', format: 'uuid' },
                        name: { type: 'string' },
                        level: { type: 'integer' }
                      }
                    }
                  }
                },
                token: { type: 'string' },
                refreshToken: { type: 'string' }
              }
            }
          }
        },
        RefreshTokenRequest: {
          type: 'object',
          required: ['refreshToken'],
          properties: {
            refreshToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' }
          }
        },
        RefreshTokenResponse: {
          type: 'object',
          properties: {
            status: { type: 'string', example: 'success' },
            data: {
              type: 'object',
              properties: {
                token: { type: 'string' }
              }
            }
          }
        },
        // Modelos de usuário
        User: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            cpf: { type: 'string', example: '123.456.789-00' },
            nome: { type: 'string', example: 'Nome do Usuário' },
            telefone: { type: 'string', example: '(11) 98765-4321' },
            email: { type: 'string', format: 'email', example: 'usuario@exemplo.com' },
            avatar: { type: 'string', format: 'uri', nullable: true },
            cidade: { type: 'string', example: 'São Paulo' },
            estado: { type: 'string', example: 'SP' },
            role: { $ref: '#/components/schemas/Role' },
            status: { $ref: '#/components/schemas/Status' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        CreateUserRequest: {
          type: 'object',
          required: ['cpf', 'nome', 'telefone', 'email', 'senha', 'cidade', 'estado', 'roleId', 'statusId'],
          properties: {
            cpf: { type: 'string', example: '123.456.789-00' },
            nome: { type: 'string', example: 'Nome do Usuário' },
            telefone: { type: 'string', example: '(11) 98765-4321' },
            email: { type: 'string', format: 'email', example: 'usuario@exemplo.com' },
            senha: { type: 'string', format: 'password', example: 'senha123' },
            avatar: { type: 'string', format: 'uri', nullable: true },
            cidade: { type: 'string', example: 'São Paulo' },
            estado: { type: 'string', example: 'SP' },
            roleId: { type: 'string', format: 'uuid' },
            statusId: { type: 'string', format: 'uuid' }
          }
        },
        UpdateUserRequest: {
          type: 'object',
          properties: {
            cpf: { type: 'string', example: '123.456.789-00' },
            nome: { type: 'string', example: 'Nome do Usuário' },
            telefone: { type: 'string', example: '(11) 98765-4321' },
            email: { type: 'string', format: 'email', example: 'usuario@exemplo.com' },
            senha: { type: 'string', format: 'password', example: 'senha123' },
            avatar: { type: 'string', format: 'uri', nullable: true },
            cidade: { type: 'string', example: 'São Paulo' },
            estado: { type: 'string', example: 'SP' },
            roleId: { type: 'string', format: 'uuid' },
            statusId: { type: 'string', format: 'uuid' }
          }
        },
        UserListResponse: {
          type: 'object',
          properties: {
            data: { 
              type: 'array', 
              items: { $ref: '#/components/schemas/User' } 
            },
            total: { type: 'integer', example: 100 },
            page: { type: 'integer', example: 1 },
            limit: { type: 'integer', example: 10 },
            totalPages: { type: 'integer', example: 10 }
          }
        },
        // Modelos de perfil (role)
        Role: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            name: { type: 'string', example: 'Administrador' },
            level: { type: 'integer', example: 100 },
            status: { type: 'integer', example: 1, description: '1 = ativo, 0 = inativo' }
          }
        },
        CreateRoleRequest: {
          type: 'object',
          required: ['name', 'level', 'status'],
          properties: {
            name: { type: 'string', example: 'Gerente' },
            level: { type: 'integer', example: 50 },
            status: { type: 'integer', example: 1, description: '1 = ativo, 0 = inativo' }
          }
        },
        UpdateRoleRequest: {
          type: 'object',
          properties: {
            name: { type: 'string', example: 'Gerente' },
            level: { type: 'integer', example: 50 },
            status: { type: 'integer', example: 1, description: '1 = ativo, 0 = inativo' }
          }
        },
        RoleListResponse: {
          type: 'object',
          properties: {
            data: { 
              type: 'array', 
              items: { $ref: '#/components/schemas/Role' } 
            },
            total: { type: 'integer', example: 5 },
            page: { type: 'integer', example: 1 },
            limit: { type: 'integer', example: 10 },
            totalPages: { type: 'integer', example: 1 }
          }
        },
        // Modelos de status
        Status: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            name: { type: 'string', example: 'Ativo' }
          }
        },
        CreateStatusRequest: {
          type: 'object',
          required: ['name'],
          properties: {
            name: { type: 'string', example: 'Pendente' }
          }
        },
        UpdateStatusRequest: {
          type: 'object',
          properties: {
            name: { type: 'string', example: 'Pendente' }
          }
        },
        StatusListResponse: {
          type: 'object',
          properties: {
            data: { 
              type: 'array', 
              items: { $ref: '#/components/schemas/Status' } 
            },
            total: { type: 'integer', example: 3 },
            page: { type: 'integer', example: 1 },
            limit: { type: 'integer', example: 10 },
            totalPages: { type: 'integer', example: 1 }
          }
        }
      },
      responses: {
        UnauthorizedError: {
          description: 'Token de acesso ausente, inválido ou expirado',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  status: { type: 'string', example: 'error' },
                  type: { type: 'string', example: 'AUTHENTICATION_ERROR' },
                  message: { type: 'string', example: 'Token inválido ou expirado' }
                }
              }
            }
          }
        },
        ForbiddenError: {
          description: 'Usuário não tem permissão para acessar este recurso',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  status: { type: 'string', example: 'error' },
                  type: { type: 'string', example: 'AUTHORIZATION_ERROR' },
                  message: { type: 'string', example: 'Acesso negado. Nível mínimo requerido: 50' }
                }
              }
            }
          }
        },
        ValidationError: {
          description: 'Dados inválidos ou incompletos',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  status: { type: 'string', example: 'error' },
                  type: { type: 'string', example: 'VALIDATION_ERROR' },
                  message: { type: 'string', example: 'Erro de validação' },
                  details: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        path: { type: 'string', example: 'body.email' },
                        message: { type: 'string', example: 'Email inválido' }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        NotFoundError: {
          description: 'Recurso não encontrado',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  status: { type: 'string', example: 'error' },
                  type: { type: 'string', example: 'NOT_FOUND_ERROR' },
                  message: { type: 'string', example: 'Usuário não encontrado' }
                }
              }
            }
          }
        },
        ConflictError: {
          description: 'Conflito de recursos',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  status: { type: 'string', example: 'error' },
                  type: { type: 'string', example: 'CONFLICT_ERROR' },
                  message: { type: 'string', example: 'Este email já está em uso' }
                }
              }
            }
          }
        },
        InternalServerError: {
          description: 'Erro interno do servidor',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  status: { type: 'string', example: 'error' },
                  message: { type: 'string', example: 'Erro interno do servidor' },
                  requestId: { type: 'string', example: '5f8c7d5e-abcd-1234-abcd-1234567890ab' }
                }
              }
            }
          }
        },
        TooManyRequestsError: {
          description: 'Muitas requisições em um curto período de tempo',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  status: { type: 'string', example: 'error' },
                  type: { type: 'string', example: 'BAD_REQUEST_ERROR' },
                  message: { type: 'string', example: 'Muitas requisições, tente novamente mais tarde' }
                }
              }
            }
          },
          headers: {
            'Retry-After': {
              schema: {
                type: 'integer',
                description: 'Tempo em segundos até que novas requisições possam ser feitas'
              },
              example: 60
            }
          }
        }
      }
    },
    security: [
      { bearerAuth: [] }
    ]
  },
  apis: [
    './src/routes.ts',
    './src/modules/*/routes/*.ts',
    './src/modules/*/models/*.ts',
    './src/modules/*/controllers/*.ts',
    './src/shared/swagger/definitions/*.ts'
  ]
};

export const swaggerSpec = swaggerJSDoc(swaggerOptions);