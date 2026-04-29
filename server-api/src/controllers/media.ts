import { Request, Response } from "express";
import crypto from "crypto";
import imagekit from "../utils/imagekit.js";
import { imageKitUploadFolderName } from "../utils/imageKitUploadFolder.js";
import { detectImageKitOrphanFiles } from "../utils/imageKitOrphans.js";

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
        folder: imageKitUploadFolderName(),
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

  /** Lista archivos huérfanos en ImageKit (misma lógica que purga, sin borrar). BACKEND_KEY. */
  async detectOrphanImages(req: Request, res: Response) {
    try {
      if (!process.env.IMAGEKIT_PRIVATE_KEY) {
        return res.status(500).json({ error: "IMAGEKIT_PRIVATE_KEY no configurado" });
      }
      const result = await detectImageKitOrphanFiles();
      res.json({
        orphans: result.orphans,
        scanned: result.scanned,
        kept: result.kept,
        referencedCount: result.referencedCount,
        referencedFileNameCount: result.referencedFileNameCount,
        path: result.path,
      });
    } catch (error) {
      res.status(500).json({
        error: "Error detectando huérfanos ImageKit",
        message: error instanceof Error ? error.message : String(error),
      });
    }
  }

  /** Purga en ImageKit archivos bajo la carpeta de upload que no están referenciados en restos (BACKEND_KEY). */
  async purgeOrphanImages(req: Request, res: Response) {
    try {
      if (!process.env.IMAGEKIT_PRIVATE_KEY) {
        return res.status(500).json({ error: "IMAGEKIT_PRIVATE_KEY no configurado" });
      }

      const {
        path,
        orphans,
        scanned,
        kept,
        referencedCount,
        referencedFileNameCount,
      } = await detectImageKitOrphanFiles();
      const deleted: { fileId: string; filePath: string }[] = [];
      const errors: { fileId: string; message: string }[] = [];

      for (const f of orphans) {
        try {
          await imagekit.deleteFile(f.fileId);
          deleted.push({ fileId: f.fileId, filePath: f.filePath });
        } catch (err) {
          errors.push({
            fileId: f.fileId,
            message: err instanceof Error ? err.message : String(err),
          });
        }
      }

      res.json({
        deleted,
        errors,
        scanned,
        kept,
        referencedCount,
        referencedFileNameCount,
        path,
      });
    } catch (error) {
      res.status(500).json({
        error: "Error en purga ImageKit",
        message: error instanceof Error ? error.message : String(error),
      });
    }
  }
}

export default new mediaController();


