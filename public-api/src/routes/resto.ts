import { Router } from "express";
import restoController from "../controllers/resto.js";

const router = Router();

// Obtener Resto por Slug
router.get("/slug/:slug", restoController.getRestoBySlug);

export default router;

