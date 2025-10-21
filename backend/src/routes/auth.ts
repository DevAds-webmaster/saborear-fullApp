import { Router } from "express";
import authController from "../controllers/auth.js";

const router = Router();

router.post("/login", authController.login);

router.post("/register", authController.register);

router.post("/verify-token", authController.verifyToken);

router.post("/logout", authController.logout);

router.post("/forgot-password", authController.forgotPassword);

router.post("/reset-password", authController.resetPassword);

export default router;