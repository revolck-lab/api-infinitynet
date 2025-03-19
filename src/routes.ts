import { Router } from "express";
import { userRoutes } from "./modules/user/routes/user.routes";
import { roleRoutes } from "./modules/role/routes/role.routes";
import { statusRoutes } from "./modules/status/routes/status.routes";
import { authRoutes } from "./modules/auth/routes/auth.routes";
import { config } from "./config";
import path from "path";

const routes = Router();

// Rota raiz com informações sobre a API
routes.get("/", (req, res) => {
  res.status(200).json({
    name: "API InfinityNet",
    description: "API REST para gerenciamento de usuários, perfis e autenticação",
    version: "1.0.0",
    status: "online",
    documentation: "/api-docs", // Se implementar Swagger no futuro
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

routes.get("/health", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "API está funcionando corretamente",
    version: "1.0.0",
    environment: config.server.nodeEnv,
    timestamp: new Date(),
  });
});

// Registrar módulos de funcionalidades
routes.use("/auth", authRoutes);
routes.use("/users", userRoutes);
routes.use("/roles", roleRoutes);
routes.use("/status", statusRoutes);

export { routes };