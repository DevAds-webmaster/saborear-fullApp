import { Router } from "express";
import AuthJwt from "../middlewares/AuthJwt.js";
import mediaController from "../controllers/media.js";

const router = Router();

router.get("/signature", AuthJwt.verifyToken, (req, res) => mediaController.getSignature(req, res));
router.post("/delete", AuthJwt.verifyToken, (req, res) => mediaController.deleteImage(req, res));

export default router;


