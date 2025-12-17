import Resto from "../models/Menu.js";
import Category from "../models/Category.js";
import Dish from "../models/Dish.js";
import Parameters from "../models/Parameters.js";
import { Request, Response } from "express";


class menuController {
    constructor(){

    }

    // Crear menú
    async createMenu(req: Request, res: Response){
        try {
            const newResto = new Resto(req.body);
            const savedResto = await newResto.save();
            res.status(201).json(savedResto);
        } catch (error) {
            res.status(500).json({ error: "Error al crear Restó" });
        }
    }

    // Obtener menú por ID
    async getMenuById(req: Request, res: Response){
        try {
            const resto = await Resto.findById(req.params.id);
            if (!resto) return res.status(404).json({ error: "Restó no encontrado" });
            res.json(resto.menu);
        } catch (error) {
            res.status(500).json({ error: "Error al obtener restó" });
        }
    }

    // Actualizar menú
    async updateMenu(req: Request, res: Response){
        try {
            const resto = await Resto.findByIdAndUpdate(req.params.id, req.body, { new: true });
            res.json(resto);
        } catch (error) {
            res.status(500).json({ error: "Error al actualizar restó" });
        }
    }

    // Eliminar menú
    async deleteMenu(req: Request, res: Response){
        try {
            await Resto.findByIdAndDelete(req.params.id);
            res.json({ message: "Restó eliminado correctamente" });
        } catch (error) {
            res.status(500).json({ error: "Error al eliminar restó" });
        }
    }

    // Obtener menú por nombre
    async getMenuByNombre(req: Request, res: Response){
        try {
            const resto = await Resto.findOne({ name: req.body.nombre });
            if(!resto) return res.status(404).json({ error: "Restó no encontrado" });
            res.json(resto.menu);
        } catch (error) {
            res.status(500).json({ error: "Error al obtener restó" });
        }
    }


}

export default new menuController();
