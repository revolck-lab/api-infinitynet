import { Router } from "express";
import userController from "../controllers/UserController";
import { authMiddleware } from "../../../shared/middlewares/auth.middleware";

const userRoutes = Router();

// Rotas públicas
userRoutes.get("/", userController.getAllUsers);
userRoutes.get("/:id", userController.getUserById);

// Rotas protegidas por autenticação
userRoutes.post("/", authMiddleware, userController.createUser);
userRoutes.put("/:id", authMiddleware, userController.updateUser);
userRoutes.delete("/:id", authMiddleware, userController.deleteUser);

export { userRoutes };
