import type { Request, Response } from "express";
import { MercadoPagoConfig, PreApproval } from "mercadopago";
import dotenv from "dotenv";
import User from "../models/User.js";
import Resto from "../models/Resto.js";

dotenv.config();

const mpClient = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN || ""
});

class MpController {
  // Crear suscripción en MP
  async mpSubscribe(req: Request, res: Response) {
    try {
      const { userId, restoId, cardToken, mode, amount, currency_id, frequency, frequency_type } = req.body as {
        userId?: string;
        restoId?: string;
        cardToken?: string;
        mode?: "plan" | "direct";
        amount?: number;
        currency_id?: string;
        frequency?: number;
        frequency_type?: string;
      };
      console.log("mpSubscribe: incoming body =", req.body);
      console.log("mpSubscribe: userId =", userId, " restoId =", restoId, " cardToken present =", Boolean(cardToken));
      // Log: prefijo del token y timestamp (sin exponer el token completo)
      if (cardToken) {
        console.log("mpSubscribe: card_token_id prefix:", String(cardToken).slice(0, 8), "ts:", new Date().toISOString());
      }
      if (!userId) return res.status(400).json({ message: "userId requerido" });
      if (!restoId) return res.status(400).json({ message: "restoId requerido" });

      const user = await User.findById(userId);
      if (!user) return res.status(404).json({ message: "Usuario no encontrado" });
      const resto = await Resto.findById(restoId);
      if (!resto) return res.status(404).json({ message: "Resto no encontrado" });

      const preapprovalClient = new PreApproval(mpClient);

      // Modo directo (sin plan): usa auto_recurring + card_token_id
      if (mode === "direct") {
        const txnAmount = typeof amount === "number" ? amount : 100;
        const currency = currency_id || "ARS";
        const freq = typeof frequency === "number" ? frequency : 1;
        const freqType = frequency_type || "months";

        const preapprovalBodyDirect = {
          external_reference: resto._id.toString(),
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
        await Resto.findByIdAndUpdate(
          resto._id,
          { mp_subscription_id: mpId, subscription_status: preapproval?.status || "pending" },
          { new: true }
        );
        console.log("mpSubscribe: resto updated (direct) with mp_subscription_id =", mpId, " status =", preapproval?.status);
        return res.json({ init_point: initPoint, id: mpId });
      }

      // Modo plan (por defecto)
      const planId = process.env.MP_PLAN_ID || process.env.PLAN_ID;
      console.log("mpSubscribe: MP_PLAN_ID present =", Boolean(planId));
      if (!planId) return res.status(500).json({ message: "MP_PLAN_ID no configurado" });

      const preapprovalBodyPlan = {
        preapproval_plan_id: planId,
        external_reference: resto._id.toString(),
        reason: "Suscripción Saborear",
        payer_email: user.email,
        back_url: process.env.MP_BACK_URL || process.env.BACK_URL || "https://www.mercadopago.com.ar",
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

      await Resto.findByIdAndUpdate(
        resto._id,
        { mp_subscription_id: mpId, subscription_status: preapproval?.status || "pending" },
        { new: true }
      );
      console.log("mpSubscribe: resto updated with mp_subscription_id =", mpId, " status =", preapproval?.status);

      return res.json({ init_point: initPoint, id: mpId });
    } catch (err) {
      console.error("mpSubscribe error:", err);
      return res.status(500).json({ message: "Error creando suscripción" });
    }
  }

  // Obtener link de suscripción (plan) para redirigir al usuario, seteando external_reference = restoId
  async mpGetSubscribeLink(req: Request, res: Response) {
    try {
      const { restoId } = req.params as { restoId: string };
      const { email } = (req.query || {}) as { email?: string };
      if (!restoId) return res.status(400).json({ message: "restoId requerido" });

      const resto = await Resto.findById(restoId);
      if (!resto) return res.status(404).json({ message: "Resto no encontrado" });

      const planId = process.env.MP_PLAN_ID || process.env.PLAN_ID;
      if (!planId) return res.status(500).json({ message: "MP_PLAN_ID no configurado" });

      const preapprovalClient = new PreApproval(mpClient);
      const preapprovalBodyPlan = {
        preapproval_plan_id: planId,
        external_reference: resto._id.toString(),
        status: "pending"
      } as any;
      // Opcionales: solo si no generan requerimiento de token en tu cuenta
      // if (email) preapprovalBodyPlan.payer_email = email;
      // preapprovalBodyPlan.back_url = process.env.MP_BACK_URL || process.env.BACK_URL || "https://www.mercadopago.com.ar";

      const result = await preapprovalClient.create({ body: preapprovalBodyPlan });
      const preapproval = (result as any).body || result;
      const mpId = preapproval?.id;
      const initPoint = preapproval?.init_point || preapproval?.sandbox_init_point;

      // Guardar referencia de la suscripción creada (pendiente) en el Resto
      if (mpId) {
        await Resto.findByIdAndUpdate(
          resto._id,
          { mp_subscription_id: mpId, subscription_status: preapproval?.status || "pending" },
          { new: true }
        );
      }

      return res.json({ init_point: initPoint, id: mpId });
    } catch (err) {
      console.error("mpGetSubscribeLink error:", err);
      return res.status(500).json({ message: "Error obteniendo link de suscripción" });
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

        let resto = null;
        if (externalRef) {
          resto = await Resto.findById(externalRef);
        }
        if (!resto && mpId) {
          resto = await Resto.findOne({ mp_subscription_id: mpId });
        }

        if (resto) {
          await Resto.findByIdAndUpdate(
            resto._id,
            {
              subscription_status: status || resto.subscription_status || "inactive",
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

  // Verificar si el RESTO tiene acceso, consultando MP por external_reference = restoId
  async mpCheckAccessByResto(req: Request, res: Response) {
    try {
      const { restoId } = req.params as { restoId: string };
      if (!restoId) return res.status(400).json({ allow: false });

      const url = `https://api.mercadopago.com/preapproval/search?external_reference=${encodeURIComponent(restoId)}`;
      const resp = await fetch(url, {
        headers: { Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}` }
      });
      if (!resp.ok) return res.json({ allow: false });

      const data = await resp.json() as any;
      const results = data?.results || data?.elements || [];
      if (!Array.isArray(results) || results.length === 0) {
        return res.json({ allow: false, status: "not_found" });
      }

      const sortByDateDesc = (a: any, b: any) =>
        new Date(b.date_created || b.created || 0).getTime() - new Date(a.date_created || a.created || 0).getTime();
      const sub = results.sort(sortByDateDesc)[0];

      const status: string = sub?.status || "inactive";
      const nextPaymentDate: string | null =
        sub?.next_payment_date || sub?.auto_recurring?.next_charge_date || null;

      // Reflejar en DB
      await Resto.findByIdAndUpdate(
        restoId,
        {
          mp_subscription_id: sub?.id || null,
          subscription_status: status,
          next_payment_date: nextPaymentDate ? new Date(nextPaymentDate) : null
        },
        { new: true }
      );

      const allow = status === "authorized";
      return res.json({ allow, status, next_payment_date: nextPaymentDate });
    } catch (e) {
      console.error("mpCheckAccessByResto error:", e);
      return res.json({ allow: false });
    }
  }

  
}

export default new MpController();


