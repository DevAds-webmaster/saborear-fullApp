import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import User from "../models/User.js";
import dotenv from "dotenv";
dotenv.config();

class AuthJwt {
    constructor() {}

    async verifyToken(req: Request, res: Response, next: NextFunction) {
        try {
            const token = req.headers.authorization?.split(" ")[1];
            if (!token) {
                return res.status(401).json({ message: "No token provided" });
            }

            // Verificación síncrona
            const decoded = jwt.verify(token, process.env.JWT_SECRET || "") as any;

            // Buscar usuario en la BD
            const user = await User.findOne({ username: decoded.username || "" });
            if (!user) {
                return res.status(401).json({ message: "User not found" });
            }

            // Adjuntar usuario a la request
            (req as any).user = user;
            next();
        } catch (err) {
            return res.status(401).json({ message: "Invalid token" });
        }
    }

    generateToken(user: any) {
        if(user.username || user.email) {
            //return jwt.sign({ username: user.username, email: user.email }, process.env.JWT_SECRET || "", { expiresIn: "1h" });
            return jwt.sign({ username: user.username, email: user.email }, process.env.JWT_SECRET || "");
        }
    }
}

export default new AuthJwt();
