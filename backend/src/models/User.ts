import mongoose, { model, Schema ,Types  } from "mongoose";

export interface IUser {
    username: string;
    email: string;
    hash: string;
    session: string;
    restos: Types.ObjectId[];
}

const userSchema = new Schema<IUser>({
    username: { type: String, required: true },
    email: { type: String, required: true },
    hash: { type: String, required: true },
    session: { type: String },
    restos: [{ type: mongoose.Schema.Types.ObjectId, ref: "Resto" }]
});

export default model<IUser>("User", userSchema);