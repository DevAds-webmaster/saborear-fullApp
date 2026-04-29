import { Router, type Request, type Response, type NextFunction } from "express";
import authController from "../controllers/auth.js";
import AuthJwt from "../middlewares/AuthJwt.js";

const router = Router();

/** Manager (BACKEND_KEY) o admin autenticado (JWT) */
function registerStaffAuth(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : "";
    if (token && token === (process.env.BACKEND_KEY || "")) {
        (req as any).registerStaffViaManager = true;
        return next();
    }
    return AuthJwt.verifyToken(req, res, next);
}

router.post("/login", authController.login);


router.post("/verify-token", authController.verifyToken);

router.post("/logout", authController.logout);

router.post("/forgot-password", authController.forgotPassword);

router.post("/reset-password", authController.resetPassword);

// Register Staff (JWT admin o Manager con BACKEND_KEY + resto obligatorio)
router.post("/register-staff", registerStaffAuth, authController.registerStaff);

// Get Staff
router.get("/get-staff", AuthJwt.verifyToken, authController.getStaff);

// Delete Staff
router.delete("/delete-staff", AuthJwt.verifyToken, authController.deleteStaff);

// Reset Password Staff
router.put("/reset-password-staff", AuthJwt.verifyToken, authController.resetPasswordStaff);

//Manager app only routes
router.get("/users", authController.getUsers);
router.put("/users/:id", authController.updateUser);
router.put("/users/:id/password", authController.resetUserPassword);
router.post("/register", authController.register);


export default router;