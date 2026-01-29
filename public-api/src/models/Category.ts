import { Schema, model, Document } from "mongoose";
import { dishSchema } from "./Dish.js";
import type {IDish} from "./Dish.js";

export interface ICategory {
    name: string;
    config: {
        availableCat: boolean;
        orderCat: number;
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
    },
    dishes: IDish[];
  }

export const categorySchema = new Schema<ICategory>({
    name: { type: String, required: true },
    config: {
        availableCat: { type: Boolean, default: true },
        orderCat: { type: Number, required: true },
        descriptionCat: String,
        item1Cat: String,
        item2Cat: String,
        item3Cat: String,
        item4Cat: String,
        item5Cat: String,
        item6Cat: String,
        item7Cat: String,
        item8Cat: String,
        item9Cat: String,
        item10Cat: String,
    },
    dishes: [dishSchema]
  });


export default model<ICategory>("Category", categorySchema);

