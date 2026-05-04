import { Schema, model, Document } from "mongoose";
import { menuSchema } from "./Menu.js";
import type { IMenu } from "./Menu.js";
import { parametersSchema } from "./Parameters.js";
import type { IParameters } from "./Parameters.js";
import type { IConfig } from "./Config.js";
import type { ICartSettings } from "./CartSettings.js";
import { cartSettingsSchema } from "./CartSettings.js";
import { configSchema } from "./Config.js";
import type { IStyle } from "./Style.js";
import { styleSchema } from "./Style.js";



export interface IPrintSetup {
  showImages: boolean;
  description: string;
  headerPage: string;
  footerPage: string;
}

export interface IRestoLocation {
  /** Fuente textual principal de ubicación del local (Google formatted_address). */
  formattedAddress: string;
  /** Coordenadas WGS84 para mapas, distancias e integraciones. */
  lat?: number;
  lng?: number;
  placeId?: string;
  references?: string;
  /** Visibilidad en descubrimiento RED Sabore.ar */
  appearOnRedSaboreAr?: boolean;
  /** Radio en km para aparición en búsquedas cercanas */
  searchRadiusKm?: number;
}

export const printSetupSchema = new Schema<IPrintSetup>(
  {
    showImages: { type: Boolean, default: true },
    description: { type: String, default: "" },
    headerPage: { type: String, default: "" },
    footerPage: { type: String, default: "" },
  },
  { _id: false },
);

export const locationSchema = new Schema<IRestoLocation>(
  {
    formattedAddress: { type: String, trim: true },
    lat: {
      type: Number,
      min: -90,
      max: 90,
    },
    lng: {
      type: Number,
      min: -180,
      max: 180,
    },
    placeId: { type: String, trim: true },
    references: { type: String, trim: true },
    appearOnRedSaboreAr: { type: Boolean, default: true },
    searchRadiusKm: { type: Number, default: 5, min: 0.5, max: 100 },
  },
  { _id: false },
);

export interface IResto extends Document {
  name: string;
  slug: string;
  phone?: string;
  location?: IRestoLocation;
  /** @deprecated legacy temporal; usar location.formattedAddress */
  address?: string;
  cart_settings: ICartSettings;
  params: IParameters[];
  menu: IMenu;
  config: IConfig;
  style: IStyle;
  print_setup?: IPrintSetup;
  createdAt: Date;

  mp_subscription_id?: string | null;
  subscription_status?: string;
  next_payment_date?: Date | null;
}


export const restoSchema = new Schema<IResto>({
  name: { type: String, required: true,trim: true },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: /^[a-z0-9]+(?:-[a-z0-9]+)*$/  // solo letras minúsculas, números y guiones medios
  },
  phone: { type: String },
  location: { type: locationSchema, required: false },
  address: { type: String },
  cart_settings: cartSettingsSchema,
  params: [parametersSchema],
  menu: {type: menuSchema, required: true},
  config: {type: configSchema, required: true},
  style: {type: styleSchema, required: true},
  print_setup: { type: printSetupSchema, default: () => ({}) },
  createdAt: { type: Date, default: Date.now },

  mp_subscription_id: { type: String, default: null },
  subscription_status: { type: String, default: "active" },
  next_payment_date: { type: Date, default: null }
});

export default model<IResto>("Resto", restoSchema);