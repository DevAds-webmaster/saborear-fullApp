import Resto from "../models/Resto.js";
import { Request, Response } from "express";
import mongoose from 'mongoose';
import User from "../models/User.js";

class restoController {
    constructor(){

    }
    
    // Crear Resto
    async createResto(req: Request, res: Response) {
        const { resto, iduser } = req.body;
    
        if (!resto || !iduser)
        return res.status(401).json({ message: "Missing required fields" });
    
        if (!mongoose.Types.ObjectId.isValid(iduser)) {
        return res.status(400).json({ message: "Invalid user ID format" });
        }
    
        try {
        // Check if user exists
        const user = await User.findById(iduser);
        if (!user) return res.status(404).json({ message: "User not found" });
    
        // Crear nuevo Resto
        const newResto = new Resto(resto);
        const savedResto = await newResto.save();
    
        // Asociar el ID del Resto al usuario
        // Asegurar tipo ObjectId al pushear
        user.restos.push(savedResto._id as unknown as mongoose.Types.ObjectId);
        await user.save();
    
        res.status(201).json({
            message: "Resto creado correctamente",
            resto: savedResto,
        });
        } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al crear Restó" });
        }
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

    // Obtener Resto por Id
    async getRestoById(req: Request, res: Response){
        try {
            const resto = await Resto.findById(req.params.id);
            if (!resto) return res.status(404).json({ error: "Restó no encontrado" });
            res.json(resto);
        } catch (error) {
            res.status(500).json({ error: "Error al obtener restó" });
        }
    }

    // Update Resto
    async updateResto(req: Request, res: Response){
        const {token,restoData} = req.body;
        const user = await User.findOne({ session: token });
        if (!user) return res.status(401).json({ error: "Usuario no encontrado" });
        console.log("ID recibido:", req.params.id);
        try {
            // Verificar si el resto pertenece al usuario
            if(!user.restos.find(resto => resto._id.toString() === req.params.id.toString())) 
                return res.status(401).json({ error: "Restó no encontrado ó no pertenece al usuario" });
            
            const resto = await Resto.findByIdAndUpdate(req.params.id, restoData, { new: true });

            res.json(resto);
        } catch (error) {
            res.status(500).json({ error: "Error al actualizar restó" });
        }
    }

}

export default new restoController();
