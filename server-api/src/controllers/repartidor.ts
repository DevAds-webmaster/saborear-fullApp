import { Request, Response } from "express";
import mongoose from "mongoose";
import Repartidor, { MAX_RADIO_KM, MIN_RADIO_KM, DEFAULT_RADIO_KM } from "../models/Repartidor.js";
import Resto from "../models/Resto.js";
import { haversineKm } from "../utils/haversineKm.js";

const MAX_OBSERVACION = 500;

type CalificacionLean = {
  id_resto: any;
  calif: number;
  observacion?: string;
  fecha?: Date;
};

type RepartidorPayload = {
  nombre: string;
  dni: string;
  telefono: string;
  ubicacion: { lat: number; lon: number; direccion?: string };
  radio_km: number;
};

function resumenCalificaciones(calificaciones: CalificacionLean[] = []) {
  const cantidad = calificaciones.length;
  if (!cantidad) return { promedio: 0, cantidad: 0 };
  const suma = calificaciones.reduce((acc, c) => acc + (Number(c.calif) || 0), 0);
  return { promedio: Math.round((suma / cantidad) * 10) / 10, cantidad };
}

function userCanAccessResto(user: any, restoId: string): boolean {
  if (!user) return false;
  if (Array.isArray(user.restos) && user.restos.some((r: any) => String(r) === restoId)) return true;
  return user.resto != null && String(user.resto) === restoId;
}

function parseRepartidorPayload(body: any): { data?: RepartidorPayload; error?: string } {
  const nombre = String(body?.nombre ?? "").trim();
  const dni = String(body?.dni ?? "").replace(/[.\s-]/g, "");
  const telefono = String(body?.telefono ?? "").trim();
  const lat = Number(body?.ubicacion?.lat);
  const lon = Number(body?.ubicacion?.lon);
  const direccion = String(body?.ubicacion?.direccion ?? "").trim();
  const radioRaw = body?.radio_km;
  const radio_km = radioRaw === undefined || radioRaw === null || radioRaw === "" ? DEFAULT_RADIO_KM : Number(radioRaw);

  if (!nombre) return { error: "El nombre es obligatorio" };
  if (!/^\d{7,9}$/.test(dni)) return { error: "El DNI debe tener entre 7 y 9 dígitos" };
  if (!telefono) return { error: "El teléfono es obligatorio" };
  if (!Number.isFinite(lat) || lat < -90 || lat > 90) return { error: "Latitud inválida" };
  if (!Number.isFinite(lon) || lon < -180 || lon > 180) return { error: "Longitud inválida" };
  if (!Number.isFinite(radio_km) || radio_km < MIN_RADIO_KM || radio_km > MAX_RADIO_KM) {
    return { error: `El radio debe estar entre ${MIN_RADIO_KM} y ${MAX_RADIO_KM} km` };
  }

  return {
    data: {
      nombre,
      dni,
      telefono,
      ubicacion: { lat, lon, ...(direccion ? { direccion } : {}) },
      radio_km,
    },
  };
}

/** Repartidor completo para el Manager (incluye DNI y observaciones). */
function toManagerDto(rep: any) {
  const calificaciones: CalificacionLean[] = rep.calificaciones || [];
  return {
    _id: String(rep._id),
    nombre: rep.nombre,
    dni: rep.dni,
    telefono: rep.telefono,
    ubicacion: rep.ubicacion,
    radio_km: rep.radio_km,
    ...resumenCalificaciones(calificaciones),
    calificaciones: calificaciones.map((c) => {
      const resto = c.id_resto && typeof c.id_resto === "object" && "name" in c.id_resto ? c.id_resto : null;
      return {
        id_resto: String(resto?._id ?? c.id_resto ?? ""),
        resto_nombre: resto?.name ?? null,
        resto_slug: resto?.slug ?? null,
        calif: c.calif,
        observacion: c.observacion ?? "",
        fecha: c.fecha ?? null,
      };
    }),
    createdAt: rep.createdAt,
    updatedAt: rep.updatedAt,
  };
}

/** Repartidor visible para la App: sin DNI ni observaciones de otros restos. */
function toCercanoDto(rep: any, restoId: string, distanciaKm: number) {
  const calificaciones: CalificacionLean[] = rep.calificaciones || [];
  const mia = calificaciones.find((c) => String(c.id_resto) === restoId);
  return {
    _id: String(rep._id),
    nombre: rep.nombre,
    telefono: rep.telefono,
    ...resumenCalificaciones(calificaciones),
    distanciaKm: Math.round(distanciaKm * 10) / 10,
    miCalificacion: mia ? { calif: mia.calif, observacion: mia.observacion ?? "" } : null,
  };
}

async function getRestoCoords(restoId: string): Promise<{ found: boolean; lat?: number; lng?: number }> {
  const resto: any = await Resto.findById(restoId).select("location").lean();
  if (!resto) return { found: false };
  const lat = resto.location?.lat;
  const lng = resto.location?.lng;
  if (typeof lat !== "number" || typeof lng !== "number") return { found: true };
  return { found: true, lat, lng };
}

class repartidorController {
  async list(req: Request, res: Response) {
    try {
      const reps = await Repartidor.find()
        .sort({ nombre: 1 })
        .populate("calificaciones.id_resto", "name slug")
        .lean();
      res.json({ repartidores: reps.map(toManagerDto) });
    } catch (error) {
      res.status(500).json({ message: "Error al obtener repartidores" });
    }
  }

  async create(req: Request, res: Response) {
    try {
      const { data, error } = parseRepartidorPayload(req.body);
      if (!data) return res.status(400).json({ message: error });

      const created = await Repartidor.create(data);
      res.status(201).json({ message: "Repartidor creado", repartidor: toManagerDto(created.toObject()) });
    } catch (error: any) {
      if (error?.code === 11000) {
        return res.status(409).json({ message: "Ya existe un repartidor con ese DNI" });
      }
      res.status(500).json({ message: "Error al crear repartidor" });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const id = String(req.params.id);
      if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ message: "Id inválido" });

      const { data, error } = parseRepartidorPayload(req.body);
      if (!data) return res.status(400).json({ message: error });

      const updated = await Repartidor.findByIdAndUpdate(id, { $set: data }, { new: true, runValidators: true })
        .populate("calificaciones.id_resto", "name slug")
        .lean();
      if (!updated) return res.status(404).json({ message: "Repartidor no encontrado" });

      res.json({ message: "Repartidor actualizado", repartidor: toManagerDto(updated) });
    } catch (error: any) {
      if (error?.code === 11000) {
        return res.status(409).json({ message: "Ya existe un repartidor con ese DNI" });
      }
      res.status(500).json({ message: "Error al actualizar repartidor" });
    }
  }

  async remove(req: Request, res: Response) {
    try {
      const id = String(req.params.id);
      if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ message: "Id inválido" });

      const deleted = await Repartidor.findByIdAndDelete(id);
      if (!deleted) return res.status(404).json({ message: "Repartidor no encontrado" });

      res.json({ message: "Repartidor eliminado" });
    } catch (error) {
      res.status(500).json({ message: "Error al eliminar repartidor" });
    }
  }

  async getCercanos(req: Request, res: Response) {
    try {
      const restoId = String(req.query.restoId ?? "");
      if (!mongoose.Types.ObjectId.isValid(restoId)) return res.status(400).json({ message: "restoId inválido" });
      if (!userCanAccessResto((req as any).user, restoId)) return res.status(403).json({ message: "Forbidden" });

      const coords = await getRestoCoords(restoId);
      if (!coords.found) return res.status(404).json({ message: "Resto no encontrado" });
      if (coords.lat === undefined || coords.lng === undefined) {
        return res.json({ sinUbicacion: true, repartidores: [] });
      }
      const { lat, lng } = coords;

      // Prefiltro por latitud: ningún radio supera MAX_RADIO_KM (~111 km por grado).
      const deltaLat = MAX_RADIO_KM / 111;
      const candidatos = await Repartidor.find({
        "ubicacion.lat": { $gte: lat - deltaLat, $lte: lat + deltaLat },
      })
        .select("nombre telefono ubicacion radio_km calificaciones")
        .lean();

      const repartidores = candidatos
        .map((rep) => ({ rep, dist: haversineKm(lat, lng, rep.ubicacion.lat, rep.ubicacion.lon) }))
        .filter(({ rep, dist }) => dist <= rep.radio_km)
        .map(({ rep, dist }) => toCercanoDto(rep, restoId, dist))
        .sort((a, b) => b.promedio - a.promedio || a.distanciaKm - b.distanciaKm);

      res.json({ sinUbicacion: false, repartidores });
    } catch (error) {
      res.status(500).json({ message: "Error al obtener repartidores cercanos" });
    }
  }

  async calificar(req: Request, res: Response) {
    try {
      const id = String(req.params.id);
      const restoId = String(req.body?.restoId ?? "");
      const calif = Number(req.body?.calif);
      const observacion = String(req.body?.observacion ?? "").trim();

      if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ message: "Id inválido" });
      if (!mongoose.Types.ObjectId.isValid(restoId)) return res.status(400).json({ message: "restoId inválido" });
      if (!Number.isInteger(calif) || calif < 1 || calif > 5) {
        return res.status(400).json({ message: "La calificación debe ser un entero entre 1 y 5" });
      }
      if (observacion.length > MAX_OBSERVACION) {
        return res.status(400).json({ message: `La observación no puede superar ${MAX_OBSERVACION} caracteres` });
      }
      if (!userCanAccessResto((req as any).user, restoId)) return res.status(403).json({ message: "Forbidden" });

      const coords = await getRestoCoords(restoId);
      if (!coords.found) return res.status(404).json({ message: "Resto no encontrado" });
      if (coords.lat === undefined || coords.lng === undefined) {
        return res.status(400).json({ message: "Configurá la ubicación de tu local para calificar repartidores" });
      }

      const rep = await Repartidor.findById(id).select("ubicacion radio_km").lean();
      if (!rep) return res.status(404).json({ message: "Repartidor no encontrado" });
      const dist = haversineKm(coords.lat, coords.lng, rep.ubicacion.lat, rep.ubicacion.lon);
      if (dist > rep.radio_km) {
        return res.status(403).json({ message: "El repartidor no cubre la zona de tu local" });
      }

      const restoObjId = new mongoose.Types.ObjectId(restoId);
      const fecha = new Date();
      const setExistente = () =>
        Repartidor.updateOne(
          { _id: id, "calificaciones.id_resto": restoObjId },
          {
            $set: {
              "calificaciones.$.calif": calif,
              "calificaciones.$.observacion": observacion,
              "calificaciones.$.fecha": fecha,
            },
          },
        );

      const actualizado = await setExistente();
      if (actualizado.matchedCount === 0) {
        const insertado = await Repartidor.updateOne(
          { _id: id, "calificaciones.id_resto": { $ne: restoObjId } },
          { $push: { calificaciones: { id_resto: restoObjId, calif, observacion, fecha } } },
        );
        // Otra request del mismo resto insertó entre ambos pasos: se pisa ese voto.
        if (insertado.matchedCount === 0) await setExistente();
      }

      const final = await Repartidor.findById(id).select("nombre telefono calificaciones").lean();
      res.json({ message: "Calificación guardada", repartidor: toCercanoDto(final, restoId, dist) });
    } catch (error) {
      res.status(500).json({ message: "Error al guardar la calificación" });
    }
  }
}

export default new repartidorController();
