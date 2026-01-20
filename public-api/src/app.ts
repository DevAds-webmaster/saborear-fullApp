import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import restoRoutes from "./routes/resto.js";

dotenv.config();

const allowedOriginsFromEnv = (process.env.CORS_ORIGINS || "")
  .split(",")
  .map(o => o.trim())
  .filter(Boolean);

// Permitir localhost http/https y dominios dinámicos comunes de túneles
const defaultAllowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "https://menu.sabore.ar",
  "https://sabore.ar",
  ...allowedOriginsFromEnv,
];

const isAllowedOrigin = (origin?: string | undefined): boolean => {
  if (!origin) return true; // permitir llamadas server-to-server o herramientas
  if (defaultAllowedOrigins.includes(origin)) return true;
  // ngrok / trycloudflare
  if (/https:\/\/.*\.ngrok(-free)?\.app$/i.test(origin)) return true;
  if (/https:\/\/.*\.ngrok(-free)?\.dev$/i.test(origin)) return true;
  if (/https:\/\/.*\.trycloudflare\.com$/i.test(origin)) return true;
  return false;
};

const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    if (isAllowedOrigin(origin)) return callback(null, true);
    return callback(new Error(`CORS: origin not allowed: ${origin}`));
  },
  credentials: true,
};

const app = express();

// Middlewares
app.use(cors(corsOptions));
app.use(express.json());

app.set('trust proxy', true);

// Rutas
app.use("/resto", restoRoutes);

export default app;

