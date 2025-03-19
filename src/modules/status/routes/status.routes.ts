import { Router } from "express";
import statusController from "../controllers/StatusController";
import { jwtMiddleware } from "../../../shared/middlewares/auth.middleware";

const statusRoutes = Router();

// Rotas públicas
statusRoutes.get("/", statusController.getAllStatuses);
statusRoutes.get("/:id", statusController.getStatusById);

// Rotas protegidas por autenticação
statusRoutes.post("/", jwtMiddleware, statusController.createStatus);
statusRoutes.put("/:id", jwtMiddleware, statusController.updateStatus);
statusRoutes.delete("/:id", jwtMiddleware, statusController.deleteStatus);

export { statusRoutes };