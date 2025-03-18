import { Router } from "express";
import authController from "../controllers/auth.controller";
import { validate } from "../../../shared/middlewares/validation.middleware";
import { loginSchema, refreshTokenSchema } from "../validations/auth.schema";

const authRoutes = Router();

authRoutes.post("/login", validate(loginSchema), authController.login);
authRoutes.post(
  "/refresh",
  validate(refreshTokenSchema),
  authController.refreshToken
);

export { authRoutes };
