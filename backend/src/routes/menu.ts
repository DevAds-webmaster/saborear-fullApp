import { Router } from "express";
import menuController from "../controllers/menu.js";
import AuthJwt from "../middlewares/AuthJwt.js";

const router = Router();

// Crear menú (temporal para pruebas)
router.post("/create", AuthJwt.verifyToken, menuController.createMenu);

// Actualizar menú
router.put("/:id", AuthJwt.verifyToken, menuController.updateMenu);

// Eliminar menú
router.delete("/:id", AuthJwt.verifyToken, menuController.deleteMenu);

// Obtener menú por ID
router.get("/:id", AuthJwt.verifyToken, menuController.getMenuById);


// Obtener menú por nombre
router.post("/", menuController.getMenuByNombre);

export default router;
