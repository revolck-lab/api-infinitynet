import { Router } from "express";
import { roleRoutes } from "./modules/role/routes/role.routes";
import { statusRoutes } from "./modules/status/routes/status.routes";
import { authRoutes } from "./modules/auth/routes/auth.routes";
import { config } from "./config";
import path from "path";
import { setupSwagger } from "./shared/middlewares/swagger.middleware";

const routes = Router();

// Configuração do Swagger
setupSwagger(routes);

/**
 * @swagger
 * /:
 *   get:
 *     summary: Informações sobre a API
 *     description: Retorna informações gerais sobre a API
 *     tags:
 *       - Informações
 *     responses:
 *       200:
 *         description: Informações da API retornadas com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 name:
 *                   type: string
 *                 description:
 *                   type: string
 *                 version:
 *                   type: string
 *                 status:
 *                   type: string
 *                 documentation:
 *                   type: string
 *                 endpoints:
 *                   type: object
 *                 maintainer:
 *                   type: string
 */
routes.get("/", (req, res) => {
  res.status(200).json({
    name: "API InfinityNet",
    description: "API REST para gerenciamento de usuários, perfis e autenticação",
    version: "1.0.0",
    status: "online",
    documentation: "/api/api-docs",
    endpoints: {
      auth: "/api/auth",
      users: "/api/users",
      roles: "/api/roles",
      status: "/api/status",
      health: "/api/health"
    },
    maintainer: "InfinityNet Team"
  });
});

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Verificar saúde da API
 *     description: Verifica se a API está funcionando corretamente
 *     tags:
 *       - Informações
 *     responses:
 *       200:
 *         description: API funcionando corretamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 message:
 *                   type: string
 *                 version:
 *                   type: string
 *                 environment:
 *                   type: string
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 */
routes.get("/health", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "API está funcionando corretamente",
    version: "1.0.0",
    environment: config.server.nodeEnv,
    timestamp: new Date(),
  });
});

// Rota de diagnóstico (apenas em ambiente de desenvolvimento)
if (process.env.NODE_ENV !== 'production') {
  routes.get("/diagnostics", (req, res) => {
    const fs = require('fs');
    const path = require('path');
    const os = require('os');
    
    // Diretórios importantes para verificar
    const rootDir = process.cwd();
    const srcDir = path.join(rootDir, 'src');
    const distDir = path.join(rootDir, 'dist');
    const srcPublicDir = path.join(srcDir, 'public');
    const distPublicDir = path.join(distDir, 'public');
    
    // Função para verificar se um diretório existe e listar seus arquivos
    const checkDir = (dir) => {
      const exists = fs.existsSync(dir);
      let files = [];
      
      if (exists) {
        try {
          files = fs.readdirSync(dir);
        } catch (error) {
          files = [`Erro ao ler: ${error.message}`];
        }
      }
      
      return {
        path: dir,
        exists,
        files
      };
    };
    
    // Coleta informações do ambiente
    const diagnostics = {
      environment: {
        nodeEnv: process.env.NODE_ENV || 'development',
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch,
        hostname: os.hostname(),
        cwd: rootDir,
        memoryUsage: process.memoryUsage(),
        uptime: process.uptime()
      },
      directories: {
        root: checkDir(rootDir),
        src: checkDir(srcDir),
        dist: checkDir(distDir),
        srcPublic: checkDir(srcPublicDir),
        distPublic: checkDir(distPublicDir)
      },
      envVars: {
        PORT: process.env.PORT,
        HOST: process.env.HOST,
        DATABASE_URL: process.env.DATABASE_URL ? '[REDACTED]' : undefined,
        // Não mostrar informações sensíveis
        JWT_SECRET: process.env.JWT_SECRET ? '[REDACTED]' : undefined,
        API_KEY: process.env.API_KEY ? '[REDACTED]' : undefined,
      }
    };
    
    res.status(200).json({
      status: "success",
      data: diagnostics
    });
  });
}

// Registrar módulos de funcionalidades
routes.use("/auth", authRoutes);
routes.use("/roles", roleRoutes);
routes.use("/status", statusRoutes);

export { routes };