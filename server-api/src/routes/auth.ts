import { Router } from "express";
import authController from "../controllers/auth.js";
import AuthJwt from "../middlewares/AuthJwt.js"; 

const router = Router();

router.post("/login", authController.login);

router.post("/register", authController.register);

router.post("/verify-token", authController.verifyToken);

router.post("/logout", authController.logout);

router.post("/forgot-password", authController.forgotPassword);

router.post("/reset-password", authController.resetPassword);

// Register Staff
router.post("/register-staff", AuthJwt.verifyToken, authController.registerStaff);

// Get Staff
router.get("/get-staff", AuthJwt.verifyToken, authController.getStaff);

// Delete Staff
router.delete("/delete-staff", AuthJwt.verifyToken, authController.deleteStaff);

// Reset Password Staff
router.put("/reset-password-staff", AuthJwt.verifyToken, authController.resetPasswordStaff);
export default router;