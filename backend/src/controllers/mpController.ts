import type { Request, Response } from "express";
import { MercadoPagoConfig, PreApproval } from "mercadopago";
import dotenv from "dotenv";
import User from "../models/User.js";

dotenv.config();

const mpClient = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN || ""
});

class MpController {
  // Crear suscripción en MP
  async mpSubscribe(req: Request, res: Response) {
    try {
      const { userId, cardToken, mode, amount, currency_id, frequency, frequency_type } = req.body as {
        userId?: string;
        cardToken?: string;
        mode?: "plan" | "direct";
        amount?: number;
        currency_id?: string;
        frequency?: number;
        frequency_type?: string;
      };
      console.log("mpSubscribe: incoming body =", req.body);
      console.log("mpSubscribe: userId =", userId, " cardToken present =", Boolean(cardToken));
      // Log: prefijo del token y timestamp (sin exponer el token completo)
      if (cardToken) {
        console.log("mpSubscribe: card_token_id prefix:", String(cardToken).slice(0, 8), "ts:", new Date().toISOString());
      }
      if (!userId) return res.status(400).json({ message: "userId requerido" });

      const user = await User.findById(userId);
      if (!user) return res.status(404).json({ message: "Usuario no encontrado" });

      const preapprovalClient = new PreApproval(mpClient);

      // Modo directo (sin plan): usa auto_recurring + card_token_id
      if (mode === "direct") {
        const txnAmount = typeof amount === "number" ? amount : 100;
        const currency = currency_id || "ARS";
        const freq = typeof frequency === "number" ? frequency : 1;
        const freqType = frequency_type || "months";

        const preapprovalBodyDirect = {
          external_reference: user._id.toString(),
          reason: "Suscripción Saborear (direct)",
          payer_email: user.email,
          back_url: process.env.MP_BACK_URL || "https://www.mercadopago.com.ar",
          status: "authorized",
          card_token_id: cardToken,
          auto_recurring: {
            frequency: freq,
            frequency_type: freqType,
            transaction_amount: txnAmount,
            currency_id: currency,
          },
        } as any;
        console.log("mpSubscribe: creating preapproval (direct) with body =", {
          ...preapprovalBodyDirect,
          card_token_id: cardToken ? "***" : undefined,
        });
        const result = await preapprovalClient.create({ body: preapprovalBodyDirect });
        console.log("mpSubscribe: preapproval (direct) raw result keys =", Object.keys(result || {}));
        const preapproval = (result as any).body || result;
        console.log("mpSubscribe: preapproval (direct) parsed =", {
          id: preapproval?.id,
          status: preapproval?.status,
          init_point: preapproval?.init_point ?? preapproval?.sandbox_init_point ?? null,
        });
        const mpId = preapproval?.id;
        const initPoint = preapproval?.init_point || preapproval?.sandbox_init_point;
        await User.findByIdAndUpdate(
          user._id,
          { mp_subscription_id: mpId, subscription_status: preapproval?.status || "pending" },
          { new: true }
        );
        console.log("mpSubscribe: user updated (direct) with mp_subscription_id =", mpId, " status =", preapproval?.status);
        return res.json({ init_point: initPoint, id: mpId });
      }

      // Modo plan (por defecto)
      const planId = process.env.MP_PLAN_ID;
      console.log("mpSubscribe: MP_PLAN_ID present =", Boolean(planId));
      if (!planId) return res.status(500).json({ message: "MP_PLAN_ID no configurado" });

      const preapprovalBodyPlan = {
        preapproval_plan_id: planId,
        external_reference: user._id.toString(),
        reason: "Suscripción Saborear",
        payer_email: user.email,
        back_url: process.env.MP_BACK_URL || "https://www.mercadopago.com.ar",
        status: "authorized",
        card_token_id: cardToken
      } as any;
      console.log("mpSubscribe: creating preapproval (plan) with body =", {
        ...preapprovalBodyPlan,
        card_token_id: cardToken ? "***" : undefined // no loguear el token en claro
      });
      const result = await preapprovalClient.create({
        body: preapprovalBodyPlan
      });

      console.log("mpSubscribe: preapproval (plan) raw result keys =", Object.keys(result || {}));
      const preapproval = (result as any).body || result;
      console.log("mpSubscribe: preapproval (plan) parsed =", {
        id: preapproval?.id,
        status: preapproval?.status,
        init_point: preapproval?.init_point ?? preapproval?.sandbox_init_point ?? null
      });
      const mpId = preapproval?.id;
      const initPoint = preapproval?.init_point || preapproval?.sandbox_init_point;

      await User.findByIdAndUpdate(
        user._id,
        { mp_subscription_id: mpId, subscription_status: preapproval?.status || "pending" },
        { new: true }
      );
      console.log("mpSubscribe: user updated with mp_subscription_id =", mpId, " status =", preapproval?.status);

      return res.json({ init_point: initPoint, id: mpId });
    } catch (err) {
      console.error("mpSubscribe error:", err);
      return res.status(500).json({ message: "Error creando suscripción" });
    }
  }

  // Webhooks de MP para actualizar el estado de la suscripción
  async mpWebhooks(req: Request, res: Response) {
    try {
      const payload = req.body as any;

      // MP puede enviar diferentes formatos; intentamos resolver el id del preapproval
      const preapprovalId =
        payload?.data?.id ||
        payload?.id ||
        payload?.preapproval_id ||
        payload?.resource?.id;

      let subscription: any = null;
      if (preapprovalId) {
        try {
          const preapprovalClient = new PreApproval(mpClient);
          const fetched = await preapprovalClient.get({ id: preapprovalId });
          subscription = (fetched as any).body || fetched;
        } catch (e) {
          // noop
        }
      } else {
        // Algunos webhooks envían todo el objeto directamente
        if (payload?.type === "preapproval" || payload?.id) {
          subscription = payload;
        }
      }

      if (subscription) {
        const status: string | undefined = subscription.status;
        const nextPaymentDateRaw: string | undefined = subscription.next_payment_date || subscription.auto_recurring?.next_charge_date;
        const nextPaymentDate = nextPaymentDateRaw ? new Date(nextPaymentDateRaw) : null;
        const externalRef: string | undefined = subscription.external_reference;
        const mpId: string | undefined = subscription.id;

        let user = null;
        if (externalRef) {
          user = await User.findById(externalRef);
        }
        if (!user && mpId) {
          user = await User.findOne({ mp_subscription_id: mpId });
        }

        if (user) {
          await User.findByIdAndUpdate(
            user._id,
            {
              subscription_status: status || user.subscription_status || "inactive",
              next_payment_date: nextPaymentDate
            },
            { new: true }
          );
        }
      }

      return res.sendStatus(200);
    } catch (err) {
      console.error("mpWebhooks error:", err);
      return res.sendStatus(200);
    }
  }

  // Verificar si el usuario tiene acceso a la aplicación
  async mpCheckAccess(req: Request, res: Response) {
    try {
      const { userId } = req.params as { userId: string };
      if (!userId) return res.status(400).json({ allow: false });
      const user = await User.findById(userId);
      if (!user) return res.status(404).json({ allow: false });
      return res.json({ allow: user.subscription_status === "active" });
    } catch {
      return res.json({ allow: false });
    }
  }

  
}

export default new MpController();


