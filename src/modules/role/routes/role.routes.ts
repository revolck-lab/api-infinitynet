import { Router } from "express";
import roleController from "../controllers/RoleController";
import { authMiddleware } from "../../../shared/middlewares/auth.middleware";

const roleRoutes = Router();

// Rotas públicas
roleRoutes.get("/", roleController.getAllRoles);
roleRoutes.get("/:id", roleController.getRoleById);

// Rotas protegidas por autenticação
roleRoutes.post("/", authMiddleware, roleController.createRole);
roleRoutes.put("/:id", authMiddleware, roleController.updateRole);
roleRoutes.delete("/:id", authMiddleware, roleController.deleteRole);

export { roleRoutes };
