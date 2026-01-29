import mongoose, { model, Schema, Types } from "mongoose";

export type UserRole = "admin" | "staff";

interface IUser {
    username: string;
    role: UserRole;
    email: string;
    hash: string;
    session: string;
    restos: Types.ObjectId[];  
    resto: Types.ObjectId;
    my_staff: Types.ObjectId[]; 
}


const userSchema = new Schema<IUser>({
    username: { type: String, required: true },
    role: { type: String, enum: ["admin", "staff"], required: true },

    email: { type: String, required: true },
    hash: { type: String, required: true },
    session: { type: String },
    // Para admin
    restos: [{ type: mongoose.Schema.Types.ObjectId, ref: "Resto" }],
    // Para staff (un solo Resto)
    resto: { type: mongoose.Schema.Types.ObjectId, ref: "Resto" },
    // Para admin: lista de IDs de usuarios staff
    my_staff: [{ type: mongoose.Schema.Types.ObjectId, ref: "User", default: [] }],

});

export default model<IUser>("User", userSchema);