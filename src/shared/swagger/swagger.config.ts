// src/shared/swagger/swagger.config.ts
import swaggerJSDoc from 'swagger-jsdoc';
import { version } from '../../../package.json';
import { config } from '../../config';

// Informações básicas da API
const apiInfo = {
  title: 'InfinityNet API',
  version,
  description: `API REST moderna para gerenciamento de usuários com arquitetura modular e suporte a múltiplos tipos de usuários.
  
  ## Tipos de Usuários e Autenticação
  
  Esta API suporta três tipos de usuários com métodos de autenticação específicos:
  
  1. **Usuários de App (UserPhone)**: Login realizado via telefone e PIN.
  2. **Usuários Administradores (UserAdmin)**: Login realizado via CPF e senha.
  3. **Usuários Afiliados (UserAffiliate)**: Login realizado via CPF e senha.
  
  ## Características
  
  - ✅ Arquitetura modular inspirada em microserviços
  - ✅ Múltiplos métodos de autenticação JWT com refresh tokens
  - ✅ Validação de dados com Zod
  - ✅ Tratamento centralizado de erros
  - ✅ Logs estruturados
  - ✅ Controle de acesso baseado em perfis (RBAC)
  
  ## Autenticação
  
  Esta API suporta dois métodos de autenticação:
  
  1. **JWT (recomendado)**: Use os endpoints específicos para obter um token JWT:
     - App: \`/api/auth/login/phone\` (telefone + PIN)
     - Admin: \`/api/auth/login/admin\` (CPF + senha)
     - Afiliado: \`/api/auth/login/affiliate\` (CPF + senha)
  
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
    name: 'App Users', 
    description: 'Gerenciamento de usuários do aplicativo móvel (phone + pin)',
    externalDocs: {
      description: 'Guia de usuários do app',
      url: 'https://docs.infinitynet.com.br/app-users'
    }
  },
  { 
    name: 'Admin Users', 
    description: 'Gerenciamento de usuários administrativos (cpf + senha)',
    externalDocs: {
      description: 'Guia de usuários administrativos',
      url: 'https://docs.infinitynet.com.br/admin-users'
    }
  },
  { 
    name: 'Affiliate Users', 
    description: 'Gerenciamento de usuários afiliados (cpf + senha)',
    externalDocs: {
      description: 'Guia de usuários afiliados',
      url: 'https://docs.infinitynet.com.br/affiliate-users'
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
    
    Para obter um token JWT, use o endpoint específico para seu tipo de usuário:
    - App Users: \`/api/auth/login/phone\` (telefone + PIN)
    - Admin Users: \`/api/auth/login/admin\` (CPF + senha)
    - Affiliate Users: \`/api/auth/login/affiliate\` (CPF + senha)
    
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
        // Modelos de autenticação - App Users (Phone + PIN)
        LoginPhoneRequest: {
          type: 'object',
          required: ['telefone', 'pin'],
          properties: {
            telefone: { type: 'string', example: '(11) 98765-4321' },
            pin: { type: 'string', example: '123456' }
          }
        },
        // Modelos de autenticação - Admin e Affiliate (CPF + senha)
        LoginCpfRequest: {
          type: 'object',
          required: ['cpf', 'senha'],
          properties: {
            cpf: { type: 'string', example: '123.456.789-00' },
            senha: { type: 'string', format: 'password', example: 'senha123' }
          }
        },
        // Modelo de resposta de autenticação comum
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
                    source: { type: 'string', enum: ['phone', 'admin', 'affiliate'] },
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
        // Modelos de usuário - App (UserPhone)
        UserPhone: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            nome: { type: 'string', example: 'Nome do Usuário' },
            email: { type: 'string', format: 'email', example: 'usuario@exemplo.com' },
            telefone: { type: 'string', example: '(11) 98765-4321' },
            cpf: { type: 'string', example: '123.456.789-00' },
            endereco: { type: 'string', example: 'Rua Exemplo, 123' },
            avatar: { type: 'string', format: 'uri', nullable: true },
            cidade: { type: 'string', example: 'São Paulo' },
            estado: { type: 'string', example: 'SP' },
            role: { $ref: '#/components/schemas/Role' },
            status: { $ref: '#/components/schemas/Status' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
            lastLoginAt: { type: 'string', format: 'date-time', nullable: true }
          }
        },
        CreateUserPhoneRequest: {
          type: 'object',
          required: ['nome', 'email', 'telefone', 'cpf', 'endereco', 'cidade', 'estado', 'pin', 'roleId', 'statusId'],
          properties: {
            nome: { type: 'string', example: 'Nome do Usuário' },
            email: { type: 'string', format: 'email', example: 'usuario@exemplo.com' },
            telefone: { type: 'string', example: '(11) 98765-4321' },
            cpf: { type: 'string', example: '123.456.789-00' },
            endereco: { type: 'string', example: 'Rua Exemplo, 123' },
            cidade: { type: 'string', example: 'São Paulo' },
            estado: { type: 'string', example: 'SP' },
            pin: { type: 'string', example: '123456' },
            avatar: { type: 'string', format: 'uri', nullable: true },
            roleId: { type: 'string', format: 'uuid' },
            statusId: { type: 'string', format: 'uuid' }
          }
        },
        UpdateUserPhoneRequest: {
          type: 'object',
          properties: {
            nome: { type: 'string', example: 'Nome do Usuário' },
            email: { type: 'string', format: 'email', example: 'usuario@exemplo.com' },
            telefone: { type: 'string', example: '(11) 98765-4321' },
            cpf: { type: 'string', example: '123.456.789-00' },
            endereco: { type: 'string', example: 'Rua Exemplo, 123' },
            cidade: { type: 'string', example: 'São Paulo' },
            estado: { type: 'string', example: 'SP' },
            pin: { type: 'string', example: '123456' },
            avatar: { type: 'string', format: 'uri', nullable: true },
            roleId: { type: 'string', format: 'uuid' },
            statusId: { type: 'string', format: 'uuid' }
          }
        },
        // Modelos de usuário - Admin (UserAdmin)
        UserAdmin: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            nome: { type: 'string', example: 'Nome do Administrador' },
            email: { type: 'string', format: 'email', example: 'admin@exemplo.com' },
            telefone: { type: 'string', example: '(11) 98765-4321' },
            cpf: { type: 'string', example: '123.456.789-00' },
            endereco: { type: 'string', example: 'Rua Exemplo, 123' },
            avatar: { type: 'string', format: 'uri', nullable: true },
            cidade: { type: 'string', example: 'São Paulo' },
            estado: { type: 'string', example: 'SP' },
            role: { $ref: '#/components/schemas/Role' },
            status: { $ref: '#/components/schemas/Status' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
            lastLoginAt: { type: 'string', format: 'date-time', nullable: true }
          }
        },
        CreateUserAdminRequest: {
          type: 'object',
          required: ['nome', 'email', 'telefone', 'cpf', 'endereco', 'cidade', 'estado', 'senha', 'roleId', 'statusId'],
          properties: {
            nome: { type: 'string', example: 'Nome do Administrador' },
            email: { type: 'string', format: 'email', example: 'admin@exemplo.com' },
            telefone: { type: 'string', example: '(11) 98765-4321' },
            cpf: { type: 'string', example: '123.456.789-00' },
            endereco: { type: 'string', example: 'Rua Exemplo, 123' },
            cidade: { type: 'string', example: 'São Paulo' },
            estado: { type: 'string', example: 'SP' },
            senha: { type: 'string', format: 'password', example: 'senha123' },
            avatar: { type: 'string', format: 'uri', nullable: true },
            roleId: { type: 'string', format: 'uuid' },
            statusId: { type: 'string', format: 'uuid' }
          }
        },
        UpdateUserAdminRequest: {
          type: 'object',
          properties: {
            nome: { type: 'string', example: 'Nome do Administrador' },
            email: { type: 'string', format: 'email', example: 'admin@exemplo.com' },
            telefone: { type: 'string', example: '(11) 98765-4321' },
            cpf: { type: 'string', example: '123.456.789-00' },
            endereco: { type: 'string', example: 'Rua Exemplo, 123' },
            cidade: { type: 'string', example: 'São Paulo' },
            estado: { type: 'string', example: 'SP' },
            senha: { type: 'string', format: 'password', example: 'senha123' },
            avatar: { type: 'string', format: 'uri', nullable: true },
            roleId: { type: 'string', format: 'uuid' },
            statusId: { type: 'string', format: 'uuid' }
          }
        },
        // Modelos de usuário - Affiliate (UserAffiliate)
        UserAffiliate: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            nome: { type: 'string', example: 'Nome do Afiliado' },
            email: { type: 'string', format: 'email', example: 'afiliado@exemplo.com' },
            telefone: { type: 'string', example: '(11) 98765-4321' },
            cpf: { type: 'string', example: '123.456.789-00' },
            endereco: { type: 'string', example: 'Rua Exemplo, 123' },
            avatar: { type: 'string', format: 'uri', nullable: true },
            cidade: { type: 'string', example: 'São Paulo' },
            estado: { type: 'string', example: 'SP' },
            role: { $ref: '#/components/schemas/Role' },
            status: { $ref: '#/components/schemas/Status' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
            lastLoginAt: { type: 'string', format: 'date-time', nullable: true }
          }
        },
        CreateUserAffiliateRequest: {
          type: 'object',
          required: ['nome', 'email', 'telefone', 'cpf', 'endereco', 'cidade', 'estado', 'senha', 'roleId', 'statusId'],
          properties: {
            nome: { type: 'string', example: 'Nome do Afiliado' },
            email: { type: 'string', format: 'email', example: 'afiliado@exemplo.com' },
            telefone: { type: 'string', example: '(11) 98765-4321' },
            cpf: { type: 'string', example: '123.456.789-00' },
            endereco: { type: 'string', example: 'Rua Exemplo, 123' },
            cidade: { type: 'string', example: 'São Paulo' },
            estado: { type: 'string', example: 'SP' },
            senha: { type: 'string', format: 'password', example: 'senha123' },
            avatar: { type: 'string', format: 'uri', nullable: true },
            roleId: { type: 'string', format: 'uuid' },
            statusId: { type: 'string', format: 'uuid' }
          }
        },
        UpdateUserAffiliateRequest: {
          type: 'object',
          properties: {
            nome: { type: 'string', example: 'Nome do Afiliado' },
            email: { type: 'string', format: 'email', example: 'afiliado@exemplo.com' },
            telefone: { type: 'string', example: '(11) 98765-4321' },
            cpf: { type: 'string', example: '123.456.789-00' },
            endereco: { type: 'string', example: 'Rua Exemplo, 123' },
            cidade: { type: 'string', example: 'São Paulo' },
            estado: { type: 'string', example: 'SP' },
            senha: { type: 'string', format: 'password', example: 'senha123' },
            avatar: { type: 'string', format: 'uri', nullable: true },
            roleId: { type: 'string', format: 'uuid' },
            statusId: { type: 'string', format: 'uuid' }
          }
        },
        // Respostas de listagem paginada
        UserPhoneListResponse: {
          type: 'object',
          properties: {
            data: { 
              type: 'array', 
              items: { $ref: '#/components/schemas/UserPhone' } 
            },
            total: { type: 'integer', example: 50 },
            page: { type: 'integer', example: 1 },
            limit: { type: 'integer', example: 10 },
            totalPages: { type: 'integer', example: 5 }
          }
        },
        UserAdminListResponse: {
          type: 'object',
          properties: {
            data: { 
              type: 'array', 
              items: { $ref: '#/components/schemas/UserAdmin' } 
            },
            total: { type: 'integer', example: 15 },
            page: { type: 'integer', example: 1 },
            limit: { type: 'integer', example: 10 },
            totalPages: { type: 'integer', example: 2 }
          }
        },
        UserAffiliateListResponse: {
          type: 'object',
          properties: {
            data: { 
              type: 'array', 
              items: { $ref: '#/components/schemas/UserAffiliate' } 
            },
            total: { type: 'integer', example: 35 },
            page: { type: 'integer', example: 1 },
            limit: { type: 'integer', example: 10 },
            totalPages: { type: 'integer', example: 4 }
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
    ],
    paths: {
      // Autenticação
      '/auth/login/phone': {
        post: {
          tags: ['Auth'],
          summary: 'Login para usuários de app',
          description: 'Realiza a autenticação de um usuário de app (phone + PIN)',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/LoginPhoneRequest'
                }
              }
            }
          },
          responses: {
            200: {
              description: 'Autenticação realizada com sucesso',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/LoginResponse'
                  }
                }
              }
            },
            401: {
              description: 'Credenciais inválidas ou conta bloqueada',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      status: { type: 'string', example: 'error' },
                      message: { type: 'string', example: 'Credenciais inválidas' }
                    }
                  }
                }
              }
            },
            400: {
              $ref: '#/components/responses/ValidationError'
            },
            429: {
              $ref: '#/components/responses/TooManyRequestsError'
            }
          }
        }
      },
      '/auth/login/admin': {
        post: {
          tags: ['Auth'],
          summary: 'Login para usuários administrativos',
          description: 'Realiza a autenticação de um usuário administrativo (CPF + senha)',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/LoginCpfRequest'
                }
              }
            }
          },
          responses: {
            200: {
              description: 'Autenticação realizada com sucesso',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/LoginResponse'
                  }
                }
              }
            },
            401: {
              description: 'Credenciais inválidas ou conta bloqueada',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      status: { type: 'string', example: 'error' },
                      message: { type: 'string', example: 'Credenciais inválidas' }
                    }
                  }
                }
              }
            },
            400: {
              $ref: '#/components/responses/ValidationError'
            },
            429: {
              $ref: '#/components/responses/TooManyRequestsError'
            }
          }
        }
      },
      '/auth/login/affiliate': {
        post: {
          tags: ['Auth'],
          summary: 'Login para usuários afiliados',
          description: 'Realiza a autenticação de um usuário afiliado (CPF + senha)',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/LoginCpfRequest'
                }
              }
            }
          },
          responses: {
            200: {
              description: 'Autenticação realizada com sucesso',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/LoginResponse'
                  }
                }
              }
            },
            401: {
              description: 'Credenciais inválidas ou conta bloqueada',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      status: { type: 'string', example: 'error' },
                      message: { type: 'string', example: 'Credenciais inválidas' }
                    }
                  }
                }
              }
            },
            400: {
              $ref: '#/components/responses/ValidationError'
            },
            429: {
              $ref: '#/components/responses/TooManyRequestsError'
            }
          }
        }
      },
      '/auth/refresh': {
        post: {
          tags: ['Auth'],
          summary: 'Atualizar token de acesso',
          description: 'Utiliza um refresh token válido para obter um novo token de acesso',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/RefreshTokenRequest'
                }
              }
            }
          },
          responses: {
            200: {
              description: 'Token atualizado com sucesso',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/RefreshTokenResponse'
                  }
                }
              }
            },
            400: {
              $ref: '#/components/responses/ValidationError'
            },
            401: {
              description: 'Refresh token inválido ou expirado',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      status: { type: 'string', example: 'error' },
                      message: { type: 'string', example: 'Refresh token inválido ou expirado' }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
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