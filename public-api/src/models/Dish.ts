import { Schema, model, Document } from "mongoose";

export interface IDish {
    title: string;
    description?: string;
    price: number;
    discountPrice: number;
    "menu-dia": boolean;
    available: boolean;
    dayDish:boolean;
    glutenFree: boolean;
    veggie: boolean;
    image?: {
        secure_url: string;
        public_id: string;
        width?: number;
        height?: number;
        format?: string;
    };
    featuredText: string;
    featuredTextColor: string;
    EnDisplayDePaso: boolean;
    "EnDisplayComercial-1": boolean;
    "EnDisplayComercial-2": boolean;
    "EnDisplayComercial-3": boolean;
    
  }

export const dishSchema = new Schema<IDish>({
    title: { type: String, required: true },
    description: String,
    price: { type: Number, required: true },
    discountPrice: { type: Number, required: true },
    "menu-dia": { type: Boolean, required: true },
    available: { type: Boolean, required: true },
    dayDish: { type: Boolean, required: true },
    glutenFree: { type: Boolean, required: true },
    veggie: { type: Boolean, required: true },
    image: {
        secure_url: { type: String, required: false },
        public_id: { type: String, required: false },
        width: { type: Number, required: false },
        height: { type: Number, required: false },
        format: { type: String, required: false }
    },
    featuredText: { type: String, required: true },
    featuredTextColor: { type: String, required: true },
    EnDisplayDePaso: { type: Boolean, required: true },
    "EnDisplayComercial-1": { type: Boolean, required: true },
    "EnDisplayComercial-2": { type: Boolean, required: true },
    "EnDisplayComercial-3": { type: Boolean, required: true }
});


export default model<IDish>("Dish", dishSchema);

