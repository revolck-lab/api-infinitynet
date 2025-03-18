import { Router } from "express";
import { userRoutes } from "./modules/user/routes/user.routes";
import { roleRoutes } from "./modules/role/routes/role.routes";
import { statusRoutes } from "./modules/status/routes/status.routes";

const routes = Router();

// Health check route
routes.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    message: "API está funcionando corretamente",
    timestamp: new Date(),
  });
});

// Register feature modules
routes.use("/users", userRoutes);
routes.use("/roles", roleRoutes);
routes.use("/status", statusRoutes);

export { routes };
