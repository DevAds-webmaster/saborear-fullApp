import { Request, Response } from "express";
import cloudinary from "../utils/cloudinary.js";

class mediaController {
    async getSignature(req: Request, res: Response) {
        try {
            const timestamp = Math.round(Date.now() / 1000);
            const folder = process.env.CLOUDINARY_UPLOAD_FOLDER || "saborear";
            const paramsToSign: Record<string, any> = { timestamp, folder };
            const signature = (cloudinary as any).utils.api_sign_request(
                paramsToSign,
                process.env.CLOUDINARY_API_SECRET as string
            );

            res.json({
                timestamp,
                signature,
                api_key: process.env.CLOUDINARY_API_KEY,
                cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
                folder,
            });
        } catch (error) {
            res.status(500).json({ error: "Error al generar firma" });
        }
    }

    async deleteImage(req: Request, res: Response) {
        try {
            const { public_id } = req.body as { public_id?: string };
            if (!public_id) return res.status(400).json({ error: "public_id requerido" });
            await cloudinary.uploader.destroy(public_id, { resource_type: "image" });
            res.json({ ok: true });
        } catch (error) {
            res.status(500).json({ error: "Error eliminando imagen" });
        }
    }
}

export default new mediaController();


