import { Schema, model, Document } from "mongoose";
import { menuSchema } from "./Menu.js";
import type { IMenu } from "./Menu.js";
import { parametersSchema } from "./Parameters.js";
import type { IParameters } from "./Parameters.js";
import type { IConfig } from "./Config.js";
import { configSchema } from "./Config.js";
import type { IStyle } from "./Style.js";
import { styleSchema } from "./Style.js";



export interface IResto extends Document {
  name: string;
  slug: string;
  params: IParameters[];
  menu: IMenu;
  config: IConfig;
  style: IStyle;
  createdAt: Date;
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
  params: [parametersSchema],
  menu: menuSchema,
  config: configSchema,
  style: styleSchema,
  createdAt: { type: Date, default: Date.now }
});

export default model<IResto>("Resto", restoSchema);