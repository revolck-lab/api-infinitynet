import { Router } from "express";
import { userRoutes } from "./modules/user/routes/user.routes";
import { roleRoutes } from "./modules/role/routes/role.routes";
import { statusRoutes } from "./modules/status/routes/status.routes";
import { authRoutes } from "./modules/auth/routes/auth.routes";
import { config } from "./config";

const routes = Router();


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
