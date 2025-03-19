import { Router } from "express";
import roleController from "../controllers/RoleController";
import { jwtMiddleware } from "../../../shared/middlewares/auth.middleware";

const roleRoutes = Router();

// Rotas públicas
roleRoutes.get("/", roleController.getAllRoles);
roleRoutes.get("/:id", roleController.getRoleById);

// Rotas protegidas por autenticação
roleRoutes.post("/", jwtMiddleware, roleController.createRole);
roleRoutes.put("/:id", jwtMiddleware, roleController.updateRole);
roleRoutes.delete("/:id", jwtMiddleware, roleController.deleteRole);

export { roleRoutes };