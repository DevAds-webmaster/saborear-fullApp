import { Schema, model, Document } from "mongoose";
import { categorySchema } from "./Category.js";
import type { ICategory } from "./Category.js";




export interface IMenu extends Document {
  name: string;
  description?: string;
  categories: ICategory[];
  menu_day_config:IMDC;
  createdAt: Date;
}

export interface IMDC {
  titleCat?: string;
  descriptionCat?: string;
  item1Cat?: string;
  item2Cat?: string;
  item3Cat?: string;
  item4Cat?: string;
  item5Cat?: string;
  item6Cat?: string;
  item7Cat?: string;
  item8Cat?: string;
  item9Cat?: string;
  item10Cat?: string;
}

export const IMDCSchema = new Schema<IMDC>({
  titleCat: { type: String},
  descriptionCat: { type: String},
  item1Cat:{ type: String},
  item2Cat: { type: String},
  item3Cat: { type: String},
  item4Cat:{ type: String},
  item5Cat: { type: String},
  item6Cat: { type: String},
  item7Cat: { type: String},
  item8Cat: { type: String},
  item9Cat: { type: String},
  item10Cat: { type: String}
});

export const menuSchema = new Schema<IMenu>({
  name: { type: String, required: true },
  description: String,
  categories: [categorySchema],
  menu_day_config: IMDCSchema,
  createdAt: { type: Date, default: Date.now }
});

export default model<IMenu>("Menu", menuSchema);

