import dotenv from "dotenv";
import path from "path";

// Carrega o arquivo .env apropriado para o ambiente
dotenv.config({
  path: path.resolve(
    process.cwd(),
    `.env${process.env.NODE_ENV ? `.${process.env.NODE_ENV}` : ""}`
  ),
});

/**
 * Configurações centralizadas da aplicação
 * Todas as variáveis de ambiente e constantes de configuração devem estar aqui
 */
export const config = {
  // Adicione esta nova seção para Redis
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
    // Tempo de expiração padrão para cache
    defaultExpiry: 3600, // 1 hora em segundos
  },

  // Servidor
  server: {
    port: parseInt(process.env.PORT || "3000", 10),
    nodeEnv: process.env.NODE_ENV || "development",
    isDev: process.env.NODE_ENV !== "production",
    host: process.env.HOST || "localhost",
    apiPrefix: "/api",
  },

  // Banco de dados
  database: {
    url: process.env.DATABASE_URL || "",
  },

  // Autenticação
  auth: {
    // Chave API para compatibilidade com a versão anterior
    apiKey: process.env.API_KEY || "default_api_key",

    // Configurações JWT (para nova implementação)
    jwt: {
      secret: process.env.JWT_SECRET || "sua-chave-secreta-muito-segura",
      expiresIn: process.env.JWT_EXPIRES_IN || "1d",
      refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
    },

    // Configurações para hash de senha
    bcrypt: {
      saltRounds: 10,
    },
  },

  // Configurações de cors
  cors: {
    allowedOrigins: (process.env.CORS_ALLOWED_ORIGINS || "*").split(","),
    allowedMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  },

  // Configurações de log
  log: {
    level: process.env.LOG_LEVEL || "info",
    prettyPrint: process.env.NODE_ENV !== "production",
  },
};
