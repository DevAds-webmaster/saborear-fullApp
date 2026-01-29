import { Schema, model } from "mongoose";

export type OrderType = "delivery" | "local" | "retiro";

export interface IOrderTypeSetting {
    type: OrderType;
    enabled: boolean;
}

export interface ICartSettings {
    template: string;
    deliveryFee: number;
    orderTypes: IOrderTypeSetting[];
}

export const cartSettingsSchema = new Schema<ICartSettings>({
    template: { type: String, required: true },
    deliveryFee: { type: Number, required: false, default: 0 },
    orderTypes: {
        type: [
            new Schema<IOrderTypeSetting>({
                type: { type: String, enum: ["delivery", "local", "retiro"], required: true },
                enabled: { type: Boolean, required: true, default: true },
            }, { _id: false }),
        ],
        default: [
            { type: "delivery", enabled: true },
            { type: "local", enabled: true },
            { type: "retiro", enabled: true },
        ],
        required: false,
    },
});

export default model<ICartSettings>("CartSettings", cartSettingsSchema);