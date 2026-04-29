import { Router } from "express";
import AuthJwt from "../middlewares/AuthJwt.js";
import { requireBackendKey } from "../middlewares/backendKeyAuth.js";
import mediaController from "../controllers/media.js";

const router = Router();

// Auth para ImageKit
router.get("/ik-auth", AuthJwt.verifyToken, (req, res) => mediaController.getIKAuth(req, res));
// Eliminar por fileId
router.post("/delete", AuthJwt.verifyToken, (req, res) => mediaController.deleteImage(req, res));
// Purga huérfanos ImageKit (manager: BACKEND_KEY)
router.get("/purge-orphan-images", requireBackendKey, (req, res) => mediaController.purgeOrphanImages(req, res));
// Deteccion de imagenes huérfanas en ImageKit (manager: BACKEND_KEY)
router.get("/detect-orphan-images", requireBackendKey, (req, res) => mediaController.detectOrphanImages(req, res));

export default router;


