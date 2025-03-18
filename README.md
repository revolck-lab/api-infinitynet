# API REST com Node.js e TypeScript

Este projeto é uma API REST construída com Node.js e TypeScript, utilizando o framework Express e seguindo uma arquitetura modular inspirada em microserviços.

## Requisitos

- Node.js (v14 ou superior)
- npm (v6 ou superior)

## Instalação

1. Clone este repositório
2. Instale as dependências:
   ```bash
   npm install
   ```
3. Copie o arquivo `.env.example` para `.env` e configure as variáveis de ambiente:
   ```bash
   cp .env.example .env
   ```
4. Execute o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

## Scripts disponíveis

- `npm run dev`: Inicia o servidor de desenvolvimento com hot-reload
- `npm run build`: Compila o projeto TypeScript para JavaScript
- `npm start`: Inicia o servidor em modo de produção (após build)
- `npm run lint`: Executa o linter no código

## Estrutura do Projeto

A estrutura do projeto segue uma abordagem modular, onde cada recurso ou domínio tem seu próprio módulo com controllers, services, routes e models:

```
src/
├── config/                # Configurações da aplicação
├── modules/               # Módulos da aplicação
│   └── user/              # Módulo de usuários
│       ├── controllers/   # Controladores do módulo
│       ├── models/        # Modelos e interfaces
│       ├── routes/        # Rotas do módulo
│       └── services/      # Serviços com a lógica de negócios
├── shared/                # Recursos compartilhados entre módulos
│   ├── errors/            # Classes de erro customizadas
│   ├── middlewares/       # Middlewares globais
│   └── utils/             # Funções utilitárias
├── app.ts                 # Configuração do Express
├── routes.ts              # Registro de rotas dos módulos
└── server.ts              # Ponto de entrada da aplicação
```

## Endpoints da API

### Health Check

- `GET /api/health`: Verifica se a API está funcionando

### Usuários

- `GET /api/users`: Lista todos os usuários (paginado)
  - Query params: page, limit
- `GET /api/users/:id`: Obtém um usuário específico
- `POST /api/users`: Cria um novo usuário (requer autenticação)
- `PUT /api/users/:id`: Atualiza um usuário existente (requer autenticação)
- `DELETE /api/users/:id`: Remove um usuário (requer autenticação)

## Autenticação

Esta API utiliza autenticação simples por chave API. Para acessar endpoints protegidos, inclua o cabeçalho `x-api-key` com a chave API configurada no arquivo `.env`.

## Extensão da Arquitetura

Esta arquitetura modular facilita a adição de novos recursos ao sistema:

1. Crie um novo diretório dentro de `src/modules` para o novo recurso (ex: `product`)
2. Siga a mesma estrutura do módulo de usuário, criando `controllers`, `services`, `models` e `routes`
3. Registre as rotas do novo módulo no arquivo `src/routes.ts`

Para adicionar integrações com bancos de dados, adicione um diretório `repositories` dentro do módulo ou em `src/shared` para repositórios compartilhados.
