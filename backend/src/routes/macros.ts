import { Router } from "express";
import macrosController from "../controllers/macros.js";
import AuthJwt from "../middlewares/AuthJwt.js";

const router = Router();

// Obtener style options (protegido)
router.get("/style-options", AuthJwt.verifyToken, (req, res) => macrosController.getMacrosOptionStyles(req, res));

//Update style options
router.put("/style-options", AuthJwt.verifyToken, (req, res) => macrosController.updateMacrosOptionStyles(req, res));

//Insert style options
router.post("/style-options", AuthJwt.verifyToken, (req, res) => macrosController.insertMacrosOptionStyles(req, res));

//Delete style options
router.delete("/style-options", AuthJwt.verifyToken, (req, res) => macrosController.deleteMacrosOptionStyles(req, res));

// Obtener themes (protegido)
router.get("/themes", AuthJwt.verifyToken, (req, res) => macrosController.getMacrosThemes(req, res));

//Update themes
router.put("/themes", AuthJwt.verifyToken, (req, res) => macrosController.updateMacrosThemes(req, res));

//Insert themes
router.post("/themes", AuthJwt.verifyToken, (req, res) => macrosController.insertMacrosThemes(req, res));

//Delete themes
router.delete("/themes", AuthJwt.verifyToken, (req, res) => macrosController.deleteMacrosThemes(req, res));

export default router;


