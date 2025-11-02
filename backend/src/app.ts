import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import menuRoutes from "./routes/menu.js";
import authRoutes from "./routes/auth.js";
import restoRoutes from "./routes/resto.js";
import macrosRoutes from "./routes/macros.js";
import mediaRoutes from "./routes/media.js";
import bodyParser from 'body-parser';

dotenv.config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));



// Rutas
app.use("/menu", menuRoutes);
app.use("/auth", authRoutes);
app.use("/resto", restoRoutes);
app.use("/macros", macrosRoutes);
app.use("/media", mediaRoutes);

export default app;
