import { Router } from "express";
import restoController from "../controllers/resto.js";

const router = Router();

router.get("/red/nearby", restoController.getRedNearby.bind(restoController));

// Obtener Resto por Slug
router.get("/slug/:slug", restoController.getRestoBySlug);

export default router;

