import { Router } from "express";
import statusController from "../controllers/StatusController";
import { authMiddleware } from "../../../shared/middlewares/auth.middleware";

const statusRoutes = Router();

// Rotas públicas
statusRoutes.get("/", statusController.getAllStatuses);
statusRoutes.get("/:id", statusController.getStatusById);

// Rotas protegidas por autenticação
statusRoutes.post("/", authMiddleware, statusController.createStatus);
statusRoutes.put("/:id", authMiddleware, statusController.updateStatus);
statusRoutes.delete("/:id", authMiddleware, statusController.deleteStatus);

export { statusRoutes };
