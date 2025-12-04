import mongoose, { model, Schema ,Types  } from "mongoose";

export interface IUser {
    username: string;
    email: string;
    hash: string;
    session: string;
    restos: Types.ObjectId[];
    mp_subscription_id?: string | null;
    subscription_status?: string;
    next_payment_date?: Date | null;
}

const userSchema = new Schema<IUser>({
    username: { type: String, required: true },
    email: { type: String, required: true },
    hash: { type: String, required: true },
    session: { type: String },
    restos: [{ type: mongoose.Schema.Types.ObjectId, ref: "Resto" }],
    mp_subscription_id: { type: String, default: null },
    subscription_status: { type: String, default: "inactive" },
    next_payment_date: { type: Date, default: null }
});

export default model<IUser>("User", userSchema);