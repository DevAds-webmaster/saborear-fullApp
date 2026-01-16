import { Schema, model, Document } from "mongoose";

export interface ICartSettings {
    template: string;
}

export const cartSettingsSchema = new Schema<ICartSettings>({
    template: { type: String, required: true },
});

export default model<ICartSettings>("CartSettings", cartSettingsSchema);