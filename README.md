# API REST com Node.js e TypeScript

API REST moderna construída com Node.js e TypeScript, seguindo práticas recomendadas de arquitetura, segurança e escalabilidade.

## 🚀 Funcionalidades

- ✅ Arquitetura modular inspirada em microserviços
- ✅ Autenticação JWT com refresh tokens
- ✅ Validação de dados com Zod
- ✅ Tratamento centralizado de erros
- ✅ Documentação automática da API com Swagger
- ✅ Logs estruturados
- ✅ Docker e Docker Compose para desenvolvimento e produção
- ✅ Testes automatizados
- ✅ Controle de acesso baseado em perfis (RBAC)

## 📋 Requisitos

- Node.js (v14 ou superior)
- npm (v6 ou superior)
- MySQL (v8 ou superior) ou Docker

## 🛠️ Instalação

### Usando npm

1. Clone este repositório:
   ```bash
   git clone https://github.com/seu-usuario/api-typescript.git
   cd api-typescript
   ```

2. Instale as dependências:
   ```bash
   npm install
   ```

3. Configure as variáveis de ambiente:
   ```bash
   cp .env.example .env
   ```
   > Edite o arquivo `.env` com suas configurações

4. Execute a migração do banco de dados:
   ```bash
   npm run prisma:migrate
   ```

5. Popule o banco de dados com dados iniciais:
   ```bash
   npm run seed
   ```

6. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

### Usando Docker

1. Clone este repositório:
   ```bash
   git clone https://github.com/seu-usuario/api-typescript.git
   cd api-typescript
   ```

2. Inicie os containers:
   ```bash
   npm run docker:up
   ```

3. Execute a migração e o seed:
   ```bash
   docker exec -it api-typescript npm run prisma:migrate
   docker exec -it api-typescript npm run seed
   ```

## 🔍 Scripts disponíveis

- `npm run dev` - Inicia o servidor de desenvolvimento com hot-reload
- `npm run build` - Compila o projeto TypeScript para JavaScript
- `npm start` - Inicia o servidor em modo de produção
- `npm test` - Executa os testes
- `npm run lint` - Verifica o código com ESLint
- `npm run format` - Formata o código com Prettier
- `npm run prisma:generate` - Gera o cliente Prisma
- `npm run prisma:migrate` - Executa migrações pendentes
- `npm run prisma:studio` - Abre a interface do Prisma Studio
- `npm run seed` - Popula o banco de dados com dados iniciais
- `npm run docker:up` - Inicia os containers Docker
- `npm run docker:down` - Para os containers Docker

## 🏗️ Estrutura do Projeto

```
src/
├── config/                # Configurações centralizadas
├── modules/               # Módulos da aplicação (por domínio)
│   ├── auth/              # Módulo de autenticação
│   │   ├── controllers/   # Controladores
│   │   ├── routes/        # Rotas
│   │   ├── services/      # Serviços
│   │   └── validations/   # Esquemas de validação
│   ├── user/              # Módulo de usuários
│   ├── role/              # Módulo de perfis
│   └── status/            # Módulo de status
├── shared/                # Recursos compartilhados
│   ├── errors/            # Classes de erro
│   ├── middlewares/       # Middlewares globais
│   └── services/          # Serviços compartilhados
├── app.ts                 # Configuração do Express
├── routes.ts              # Registro de rotas
└── server.ts              # Ponto de entrada
```

## 🔐 Autenticação

A API utiliza dois métodos de autenticação:

1. **JWT (JSON Web Token)** - Para autenticação de usuários
   - Login: `POST /api/auth/login`
   - Refresh Token: `POST /api/auth/refresh`

2. **API Key** - Para compatibilidade legada
   - Inclua o cabeçalho `x-api-key` com a chave configurada no `.env`

## 📚 Documentação

A documentação da API está disponível em:

```
http://localhost:3000/api-docs
```

## 📝 Contribuindo

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/amazing-feature`)
3. Faça commit das suas alterações (`git commit -m 'Add some amazing feature'`)
4. Faça push para a branch (`git push origin feature/amazing-feature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está licenciado sob a Licença ISC - veja o arquivo LICENSE para detalhes.