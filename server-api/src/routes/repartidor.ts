import { Router } from "express";
import AuthJwt from "../middlewares/AuthJwt.js";
import { requireBackendKey } from "../middlewares/backendKeyAuth.js";
import repartidorController from "../controllers/repartidor.js";

const router = Router();

// App restaurante (JWT)
router.get("/cercanos", AuthJwt.verifyToken, (req, res) => repartidorController.getCercanos(req, res));
router.put("/:id/calificacion", AuthJwt.verifyToken, (req, res) => repartidorController.calificar(req, res));

// Manager app (BACKEND_KEY)
router.get("/", requireBackendKey, (req, res) => repartidorController.list(req, res));
router.post("/", requireBackendKey, (req, res) => repartidorController.create(req, res));
router.put("/:id", requireBackendKey, (req, res) => repartidorController.update(req, res));
router.delete("/:id", requireBackendKey, (req, res) => repartidorController.remove(req, res));

export default router;
