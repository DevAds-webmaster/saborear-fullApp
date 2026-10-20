import { Schema, model, Document, Types } from "mongoose";

export const MIN_RADIO_KM = 0.5;
export const MAX_RADIO_KM = 100;
export const DEFAULT_RADIO_KM = 5;

export interface ICalificacion {
  id_resto: Types.ObjectId;
  /** Entero del 1 al 5 */
  calif: number;
  observacion?: string;
  fecha: Date;
}

export interface IUbicacionRepartidor {
  lat: number;
  lon: number;
  /** Dirección textual de referencia (Google formatted_address). */
  direccion?: string;
}

export interface IRepartidor extends Document {
  nombre: string;
  dni: string;
  telefono: string;
  ubicacion: IUbicacionRepartidor;
  /** Radio de aparición en km alrededor de `ubicacion`. */
  radio_km: number;
  /** Un elemento por resto como máximo. */
  calificaciones: ICalificacion[];
  createdAt: Date;
  updatedAt: Date;
}

export const calificacionSchema = new Schema<ICalificacion>(
  {
    id_resto: { type: Schema.Types.ObjectId, ref: "Resto", required: true },
    calif: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
      validate: { validator: Number.isInteger, message: "La calificación debe ser un entero" },
    },
    observacion: { type: String, trim: true, maxlength: 500, default: "" },
    fecha: { type: Date, default: Date.now },
  },
  { _id: false },
);

export const ubicacionRepartidorSchema = new Schema<IUbicacionRepartidor>(
  {
    lat: { type: Number, required: true, min: -90, max: 90 },
    lon: { type: Number, required: true, min: -180, max: 180 },
    direccion: { type: String, trim: true },
  },
  { _id: false },
);

export const repartidorSchema = new Schema<IRepartidor>(
  {
    nombre: { type: String, required: true, trim: true },
    dni: { type: String, required: true, unique: true, trim: true },
    telefono: { type: String, required: true, trim: true },
    ubicacion: { type: ubicacionRepartidorSchema, required: true },
    radio_km: { type: Number, default: DEFAULT_RADIO_KM, min: MIN_RADIO_KM, max: MAX_RADIO_KM },
    calificaciones: { type: [calificacionSchema], default: [] },
  },
  { timestamps: true },
);

export default model<IRepartidor>("Repartidor", repartidorSchema, "repartidores");
