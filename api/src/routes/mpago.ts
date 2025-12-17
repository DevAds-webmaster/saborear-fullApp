import { Router } from "express";
import AuthJwt from "../middlewares/AuthJwt.js";
import mpController from "../controllers/mpController.js";

const router = Router();

router.post("/subscribe", AuthJwt.verifyToken.bind(AuthJwt), mpController.mpSubscribe.bind(mpController));
router.post("/webhooks", mpController.mpWebhooks.bind(mpController));
// Nuevo endpoint basado en restoId
router.get("/check-access/:restoId", AuthJwt.verifyToken.bind(AuthJwt), mpController.mpCheckAccessByResto.bind(mpController));
// Link de suscripción (plan) para redirección
router.get("/subscribe-link/:restoId", AuthJwt.verifyToken.bind(AuthJwt), mpController.mpGetSubscribeLink.bind(mpController));

export default router;


