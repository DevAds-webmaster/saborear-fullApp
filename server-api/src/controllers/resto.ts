import Resto from "../models/Resto.js";
import { Request, Response } from "express";
import mongoose from 'mongoose';
import User from "../models/User.js";

type RestoLocationInput = {
    formattedAddress: string;
    lat?: number;
    lng?: number;
    placeId?: string;
    references?: string;
    appearOnRedSaboreAr?: boolean;
    searchRadiusKm?: number;
};

function toNumberOrUndefined(value: unknown): number | undefined {
    if (value === null || value === undefined || value === "") return undefined;
    const num = Number(value);
    return Number.isFinite(num) ? num : Number.NaN;
}

function toBooleanOrDefault(value: unknown, defaultVal: boolean): boolean {
    if (typeof value === "boolean") return value;
    return defaultVal;
}

function sanitizeLocationPayload(locationRaw: unknown): RestoLocationInput | undefined {
    if (locationRaw === null || locationRaw === undefined) return undefined;
    if (typeof locationRaw !== "object" || Array.isArray(locationRaw)) {
        throw new Error("location debe ser un objeto");
    }

    const locationObj = locationRaw as Record<string, unknown>;
    const formattedAddress = typeof locationObj.formattedAddress === "string" ? locationObj.formattedAddress.trim() : "";
    const lat = toNumberOrUndefined(locationObj.lat);
    const lng = toNumberOrUndefined(locationObj.lng);
    const placeId = typeof locationObj.placeId === "string" ? locationObj.placeId.trim() : undefined;
    const references = typeof locationObj.references === "string" ? locationObj.references.trim() : undefined;
    const appearOnRedSaboreAr = toBooleanOrDefault(locationObj.appearOnRedSaboreAr, true);
    const radiusRaw = toNumberOrUndefined(locationObj.searchRadiusKm);
    let searchRadiusKm = radiusRaw !== undefined && Number.isFinite(radiusRaw) ? radiusRaw : 5;
    if (searchRadiusKm < 0.5 || searchRadiusKm > 100) {
        throw new Error("location.searchRadiusKm debe estar entre 0.5 y 100");
    }

    if (!formattedAddress) {
        throw new Error("location.formattedAddress es obligatorio");
    }
    if (lat !== undefined && (!Number.isFinite(lat) || lat < -90 || lat > 90)) {
        throw new Error("location.lat debe estar entre -90 y 90");
    }
    if (lng !== undefined && (!Number.isFinite(lng) || lng < -180 || lng > 180)) {
        throw new Error("location.lng debe estar entre -180 y 180");
    }

    return {
        formattedAddress,
        lat,
        lng,
        placeId: placeId || undefined,
        references: references || undefined,
        appearOnRedSaboreAr,
        searchRadiusKm,
    };
}

function sanitizeRestoPayload(restoRaw: unknown): Record<string, unknown> {
    if (!restoRaw || typeof restoRaw !== "object" || Array.isArray(restoRaw)) {
        throw new Error("resto inválido");
    }
    const resto = { ...(restoRaw as Record<string, unknown>) };
    const location = sanitizeLocationPayload(resto.location);
    if (location) resto.location = location;
    if (resto.location === undefined) delete resto.location;
    return resto;
}

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
            const sanitizedResto = sanitizeRestoPayload(resto);
            // Check if user exists
            const user = await User.findById(iduser);
            if (!user) return res.status(404).json({ message: "User not found" });

            const slugNorm = typeof sanitizedResto.slug === "string" ? sanitizedResto.slug.trim().toLowerCase() : "";
            if (slugNorm) {
                const taken = await Resto.findOne({ slug: slugNorm }).lean();
                if (taken) {
                    return res.status(409).json({
                        error: "Slug ya en uso",
                        message: "Ya existe un restaurante con ese slug. Elegí otro.",
                        code: "DUPLICATE_SLUG",
                    });
                }
            }

            // Crear nuevo Resto
            const newResto = new Resto(sanitizedResto);
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
            const err = error as Error & { code?: number; keyPattern?: Record<string, number>; errors?: unknown };
            if (
                err.message === "resto inválido" ||
                err.message === "location debe ser un objeto" ||
                err.message.includes("location.")
            ) {
                return res.status(400).json({
                    error: "Validación",
                    message: err.message,
                });
            }
            if (err.code === 11000) {
                return res.status(409).json({
                    error: "Slug ya en uso",
                    message:
                        err.keyPattern?.slug != null
                            ? "Ya existe un restaurante con ese slug."
                            : "Conflicto de datos únicos al guardar.",
                    code: "DUPLICATE_KEY",
                });
            }
            if (err.name === "ValidationError") {
                return res.status(400).json({
                    error: "Validación",
                    message: err.message,
                    details: err.errors,
                });
            }
            res.status(500).json({
                error: "Error al crear Restó: " + (err.message || String(error)),
                message: err.message || String(error),
            });
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
            // Verificar si el resto pertenece al usuario admin o staff
            if(user.role === "admin"  && !user.restos.find(resto => resto._id.toString() === req.params.id.toString())) 
                return res.status(401).json({ error: "Restó no encontrado ó no pertenece al usuario admin" });
            else if(user.role === "staff"  && user.resto._id.toString() !== req.params.id.toString() ) 
                return res.status(401).json({ error: "Restó no encontrado ó no pertenece al usuario staff" });

            const sanitizedRestoData = sanitizeRestoPayload(restoData);
            const resto = await Resto.findByIdAndUpdate(req.params.id, sanitizedRestoData, { new: true, runValidators: true });

            res.json(resto);
        } catch (error) {
            console.error(error);
            const err = error as Error;
            const message = err?.message || "Error al actualizar restó";
            if (
                message.includes("location.") ||
                message.includes("location ") ||
                message === "resto inválido" ||
                message === "location debe ser un objeto"
            ) {
                return res.status(400).json({ error: message });
            }
            res.status(500).json({ error: "Error al actualizar restó" });
        }
    }

}

export default new restoController();
