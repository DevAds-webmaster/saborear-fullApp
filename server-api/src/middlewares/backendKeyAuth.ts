import type { Request, Response, NextFunction } from "express";

/** Bearer token debe coincidir con BACKEND_KEY (mismo criterio que rutas manager en auth). */
export function requireBackendKey(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : "";
  if (!token || token !== (process.env.BACKEND_KEY || "")) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  next();
}
