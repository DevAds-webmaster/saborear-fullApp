import { Router } from "express";
import AuthJwt from "../middlewares/AuthJwt.js";
import mpController from "../controllers/mpController.js";

const router = Router();

router.post("/subscribe", AuthJwt.verifyToken.bind(AuthJwt), mpController.mpSubscribe.bind(mpController));
router.post("/webhooks", mpController.mpWebhooks.bind(mpController));
router.get("/check-access/:userId", AuthJwt.verifyToken.bind(AuthJwt), mpController.mpCheckAccess.bind(mpController));

export default router;


