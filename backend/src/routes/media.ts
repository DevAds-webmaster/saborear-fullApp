import { Router } from "express";
import AuthJwt from "../middlewares/AuthJwt.js";
import mediaController from "../controllers/media.js";

const router = Router();

// Auth para ImageKit
router.get("/ik-auth", AuthJwt.verifyToken, (req, res) => mediaController.getIKAuth(req, res));
// Eliminar por fileId
router.post("/delete", AuthJwt.verifyToken, (req, res) => mediaController.deleteImage(req, res));

export default router;


