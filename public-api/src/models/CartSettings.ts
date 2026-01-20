import { Schema, model, Document } from "mongoose";

export interface ICartSettings {
    template: string;
    deliveryFee: number;
}

export const cartSettingsSchema = new Schema<ICartSettings>({
    template: { type: String, required: true },
    deliveryFee: { type: Number, required: false, default: 0 },
});

export default model<ICartSettings>("CartSettings", cartSettingsSchema);