import { Router } from "express";
import restoController from "../controllers/resto.js";
import AuthJwt from "../middlewares/AuthJwt.js";

const router = Router();

// Crear Resto
router.post("/create", AuthJwt.verifyToken, restoController.createResto);

// Obtener Resto por Slug
router.get("/slug/:slug", restoController.getRestoBySlug);

// Obtener Resto por Id
router.get("/id/:id", restoController.getRestoById);


// Update Resto por ID
router.put("/:id", AuthJwt.verifyToken, restoController.updateResto);


export default router;
