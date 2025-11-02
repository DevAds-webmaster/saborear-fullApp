import { Router } from "express";
import macrosController from "../controllers/macros.js";
import AuthJwt from "../middlewares/AuthJwt.js";

const router = Router();

// Obtener macros (protegido)
router.get("/style-options", AuthJwt.verifyToken, (req, res) => macrosController.getMacrosOptionStyles(req, res));

//Update macros
router.put("/style-options", AuthJwt.verifyToken, (req, res) => macrosController.updateMacrosOptionStyles(req, res));

export default router;


