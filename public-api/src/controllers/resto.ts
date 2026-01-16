import Resto from "../models/Resto.js";
import { Request, Response } from "express";

class restoController {
    constructor(){

    }
    
    // Obtener Resto por Slug
    async getRestoBySlug(req: Request, res: Response){
        try {
            const resto = await Resto.findOne({ slug: req.params.slug });
            if (!resto) return res.status(404).json({ error: "Restó no encontrado" });
            res.json(resto);
        } catch (error) {
            res.status(500).json({ error: "Error al obtener restó" });
        }
    }
}

export default new restoController();

