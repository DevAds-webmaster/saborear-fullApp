import { Request, Response } from "express";
import crypto from "crypto";
import imagekit from "../utils/imagekit.js";

class mediaController {
  // Auth para ImageKit client-side upload
  async getIKAuth(req: Request, res: Response) {
    try {
      const token = crypto.randomBytes(16).toString("hex");
      const expire = Math.floor(Date.now() / 1000) + 240; // 4 minutos
      const privateKey = process.env.IMAGEKIT_PRIVATE_KEY as string;
      if (!privateKey) return res.status(500).json({ error: "IMAGEKIT_PRIVATE_KEY no configurado" });
      const signature = crypto
        .createHmac("sha1", privateKey)
        .update(token + expire)
        .digest("hex");

      res.json({
        token,
        expire,
        signature,
        publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
        urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
        folder: process.env.IMAGEKIT_UPLOAD_FOLDER || "saborear",
      });
    } catch (error) {
      res.status(500).json({ error: "Error generando auth de ImageKit" });
    }
  }

  async deleteImage(req: Request, res: Response) {
    try {
      const { fileId } = req.body as { fileId?: string };
      if (!fileId) return res.status(400).json({ error: "fileId requerido" });
      await imagekit.deleteFile(fileId);
      res.json({ ok: true });
    } catch (error) {
      res.status(500).json({ error: "Error eliminando imagen" });
    }
  }
}

export default new mediaController();


