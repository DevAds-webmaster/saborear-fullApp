import Resto from "../models/Resto.js";
import { Request, Response } from "express";
import { haversineKm } from "../utils/haversineKm.js";

const DEFAULT_SEARCH_RADIUS_KM = 5;

type LeanRestoRedNearby = {
    name: string;
    slug: string;
    address?: string;
    location?: {
        lat?: number;
        lng?: number;
        formattedAddress?: string;
        references?: string;
        searchRadiusKm?: number;
    };
    config?: { srcImgLogo?: { secure_url?: string }; description?: string };
};

export type RedNearbyRestoDto = {
    slug: string;
    name: string;
    logoUrl: string | null;
    address: string;
    references: string | null;
    description: string | null;
    distanceKm: number;
};

class restoController {
    constructor(){

    }

    async getRedNearby(req: Request, res: Response) {
        try {
            const lat = Number(req.query.lat);
            const lng = Number(req.query.lng);
            if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
                return res.status(400).json({
                    error: "lat y lng son requeridos y deben ser números válidos",
                });
            }
            if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
                return res.status(400).json({ error: "Coordenadas fuera de rango válido" });
            }

            const candidates = await Resto.find({
                "location.appearOnRedSaboreAr": true,
                "location.lat": { $exists: true, $ne: null },
                "location.lng": { $exists: true, $ne: null },
            })
                .select("name slug location address config.srcImgLogo.secure_url config.description")
                .lean<LeanRestoRedNearby[]>();

            const results: RedNearbyRestoDto[] = [];

            for (const doc of candidates) {
                const loc = doc.location;
                const rLat = loc?.lat;
                const rLng = loc?.lng;
                if (typeof rLat !== "number" || typeof rLng !== "number") continue;

                const distKm = haversineKm(lat, lng, rLat, rLng);
                const radiusKm =
                    typeof loc.searchRadiusKm === "number" && loc.searchRadiusKm > 0
                        ? loc.searchRadiusKm
                        : DEFAULT_SEARCH_RADIUS_KM;
                if (distKm > radiusKm) continue;

                const formatted = loc.formattedAddress?.trim();
                const legacy = doc.address?.trim();
                const address = formatted || legacy || "";

                const desc = doc.config?.description?.trim();
                results.push({
                    slug: doc.slug,
                    name: doc.name,
                    logoUrl: doc.config?.srcImgLogo?.secure_url ?? null,
                    address,
                    references: loc.references?.trim() || null,
                    description: desc || null,
                    distanceKm: Math.round(distKm * 100) / 100,
                });
            }

            results.sort((a, b) => a.distanceKm - b.distanceKm);
            res.json(results);
        } catch {
            res.status(500).json({ error: "Error al buscar restós cercanos en RED" });
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
}

export default new restoController();

