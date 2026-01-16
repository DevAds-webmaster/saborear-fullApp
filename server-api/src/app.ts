import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import menuRoutes from "./routes/menu.js";
import authRoutes from "./routes/auth.js";
import restoRoutes from "./routes/resto.js";
import macrosRoutes from "./routes/macros.js";
import mediaRoutes from "./routes/media.js";
import mpRoutes from "./routes/mpago.js";
import bodyParser from 'body-parser';
import path from "path";

dotenv.config();

const allowedOriginsFromEnv = (process.env.CORS_ORIGINS || "")
  .split(",")
  .map(o => o.trim())
  .filter(Boolean);

// Permitir localhost http/https y dominios dinámicos comunes de túneles
const defaultAllowedOrigins = [
  "http://localhost:5173",
  "https://localhost:5173",
  "http://localhost:5174",
  "https://localhost:5174",
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

// Asegurar que los webhooks acepten JSON aún si cambian content-type
app.use("/mp/webhooks", express.json({ type: ['application/json', 'text/plain', '*/*'] }));

app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));



// Rutas
app.use("/menu", menuRoutes);
app.use("/auth", authRoutes);
app.use("/resto", restoRoutes);
app.use("/macros", macrosRoutes);
app.use("/media", mediaRoutes);
app.use("/mp", mpRoutes);

export default app;
