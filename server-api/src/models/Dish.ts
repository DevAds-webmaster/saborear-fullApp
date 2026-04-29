import { Schema, model } from "mongoose";

export interface IDish {
    title: string;
    description?: string;
    price: number;
    discountPrice?: number;
    "menu-dia"?: boolean;
    available?: boolean;
    dayDish?: boolean;
    glutenFree?: boolean;
    veggie?: boolean;
    image?: {
        secure_url: string;
        public_id: string;
        width?: number;
        height?: number;
        format?: string;
    };
    featuredText?: string;
    featuredTextColor?: string;
    EnDisplayDePaso?: boolean;
    "EnDisplayComercial-1"?: boolean;
    "EnDisplayComercial-2"?: boolean;
    "EnDisplayComercial-3"?: boolean;
}

export const dishSchema = new Schema<IDish>({
    title: { type: String, required: true },
    description: { type: String, required: false },
    price: { type: Number, required: true },
    discountPrice: { type: Number, required: false, default: 0 },
    "menu-dia": { type: Boolean, required: false, default: false },
    available: { type: Boolean, required: false, default: true },
    dayDish: { type: Boolean, required: false, default: false },
    glutenFree: { type: Boolean, required: false, default: false },
    veggie: { type: Boolean, required: false, default: false },
    image: {
        secure_url: { type: String, required: false },
        public_id: { type: String, required: false },
        width: { type: Number, required: false },
        height: { type: Number, required: false },
        format: { type: String, required: false },
    },
    featuredText: { type: String, required: false, default: "" },
    featuredTextColor: { type: String, required: false, default: "" },
    EnDisplayDePaso: { type: Boolean, required: false, default: false },
    "EnDisplayComercial-1": { type: Boolean, required: false, default: false },
    "EnDisplayComercial-2": { type: Boolean, required: false, default: false },
    "EnDisplayComercial-3": { type: Boolean, required: false, default: false },
});

export default model<IDish>("Dish", dishSchema);
