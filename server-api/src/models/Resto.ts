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



export interface IResto extends Document {
  name: string;
  slug: string;
  phone?: string;
  address?: string;
  cart_settings: ICartSettings;
  params: IParameters[];
  menu: IMenu;
  config: IConfig;
  style: IStyle;
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
  address: { type: String },
  cart_settings: cartSettingsSchema,
  params: [parametersSchema],
  menu: menuSchema,
  config: configSchema,
  style: styleSchema,
  createdAt: { type: Date, default: Date.now },

  mp_subscription_id: { type: String, default: null },
  subscription_status: { type: String, default: "inactive" },
  next_payment_date: { type: Date, default: null }
});

export default model<IResto>("Resto", restoSchema);