import { Request, Response } from "express";
import bcrypt from "bcrypt";
import User from "../models/User.js";
import AuthJwt from "../middlewares/AuthJwt.js";
import mongoose from "mongoose";

class authController {
    constructor(){
    }
    async login(req: Request, res: Response){
        const { username, email, password } = req.body;
        if(( !username && !email )|| !password) return res.status(401).json({ message: "Missing required fields" });
        
        // Check if user exists
        const user = await User.findOne({ username }) || await User.findOne({ email });
        if(!user) return res.status(401).json({ message: "User not found" });

        const isPasswordValid = await bcrypt.compare(password, user.hash);
        if(!isPasswordValid) return res.status(401).json({ message: "Invalid password" });
        const token = AuthJwt.generateToken(user);

        user.session = token;
        await user.save();

        res.json(
            {
                user:{
                    id: user.id,
                    username: user.username,
                    email:user.email,
                    restos:user.restos,
                    resto:user.resto,
                    role:user.role,
                },
                token
            }
        );
    }

    async register(req: Request, res: Response){
        const { username, email, password, resto } = req.body;

        if (!username || !email || !password) {
            return res.status(401).json({ message: "Missing required fields" });
        }

        const userEmail = await User.findOne({ email });
        if(userEmail) return res.status(401).json({ message: "User with this email already exists" });
        const userUsername = await User.findOne({ username });
        if(userUsername) return res.status(401).json({ message: "User with this username already exists" });

        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(password, salt);

        const payload: Record<string, unknown> = { username, email, hash, role: "admin" as const };
        if (resto != null && String(resto).trim() !== "") {
            if (!mongoose.Types.ObjectId.isValid(String(resto))) {
                return res.status(400).json({ message: "Invalid resto ID format" });
            }
            payload.resto = new mongoose.Types.ObjectId(String(resto));
        }

        await User.create(payload);
        res.json({ message: "User created successfully" });
    }

    async logout(req: Request, res: Response){
        res.json({ message: "Logout successful" });
    }

    async forgotPassword(req: Request, res: Response){
        const { email } = req.body;
        const user = await User.findOne({ email });
        if(!user) return res.status(401).json({ message: "User not found" });
        const token = AuthJwt.generateToken(user);
        res.json({ token });
    }
    async resetPassword(req: Request, res: Response){
        const { email, password ,username } = req.body;
        if(!email && !username) return res.status(401).json({ message: "Email or username is required" });
        const user = await User.findOne({ email: email }) || await User.findOne({ username: username });
        if(!user) return res.status(401).json({ message: "User not found" });
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(password, salt);
        user.hash = hash;
        await user.save();
        res.json({ message: "Password reset successful" });
    }

    async verifyToken(req: Request, res: Response){
        const { token } = req.body;
        const user = await User.findOne({ session: token });
        if(!user) return res.status(401).json({ message: "User not found" });
        res.json(
            {
                user:{
                    id: user.id,
                    username: user.username,
                    email:user.email,
                    restos:user.restos,
                    resto:user.resto,
                    role:user.role,
                },
                token
            }
        );
    }

    async registerStaff(req: Request, res: Response) {
        try {
            if ((req as any).registerStaffViaManager) {
                const { username, password, email, resto } = req.body;
                if (!username || !password || resto == null || String(resto).trim() === "") {
                    return res.status(400).json({ message: "username, password and resto are required" });
                }
                if (!mongoose.Types.ObjectId.isValid(String(resto).trim())) {
                    return res.status(400).json({ message: "Invalid resto ID format" });
                }

                const exists = await User.findOne({ username });
                if (exists) {
                    return res.status(409).json({ message: "Username already in use" });
                }

                const restoId = new mongoose.Types.ObjectId(String(resto).trim());
                const salt = await bcrypt.genSalt(10);
                const hash = await bcrypt.hash(password, salt);

                const staff = await User.create({
                    username,
                    email: email || `${username}@staff.local`,
                    hash,
                    role: "staff",
                    resto: restoId,
                    session: "",
                });

                const adminOwner = await User.findOne({
                    role: "admin",
                    $or: [{ restos: restoId }, { resto: restoId }],
                });
                if (adminOwner) {
                    const staffList = Array.isArray(adminOwner.my_staff) ? adminOwner.my_staff : [];
                    adminOwner.my_staff = [...staffList, staff._id];
                    await adminOwner.save();
                }

                return res.status(201).json({
                    message: "Staff created",
                    staff: {
                        id: staff._id,
                        username: staff.username,
                        role: staff.role,
                        resto: restoId.toString(),
                    },
                });
            }

            const admin = (req as any).user;
            if (!admin) return res.status(401).json({ message: "Unauthorized" });
            if (admin.role !== "admin") {
                return res.status(403).json({ message: "Only admin can register staff" });
            }

            const { username, password, email } = req.body;
            if (!username || !password) {
                return res.status(400).json({ message: "username and password are required" });
            }

            const exists = await User.findOne({ username });
            if (exists) {
                return res.status(409).json({ message: "Username already in use" });
            }

            //Asigno el primer resto del admin a la request
            const restoId = Array.isArray(admin.restos) && admin.restos.length ? admin.restos[0] : null;
            if (!restoId) {
                return res.status(400).json({ message: "Admin has no associated Resto to assign" });
            }

            const salt = await bcrypt.genSalt(10);
            const hash = await bcrypt.hash(password, salt);

            const staff = await User.create({
                username,
                email: email || `${username}@staff.local`, // opcional (cumple el required del schema)
                hash,
                role: "staff",
                resto: restoId,
                session: ""
            });

            // Vincular al admin
            const staffList = Array.isArray(admin.my_staff) ? admin.my_staff : [];
            admin.my_staff = [...staffList, staff._id];
            await admin.save();

            return res.status(201).json({
                message: "Staff created",
                staff: {
                    id: staff._id,
                    username: staff.username,
                    role: staff.role,
                    resto: restoId
                }
            });
        } catch (err) {
            return res.status(500).json({ message: "Internal error", error: (err as Error).message });
        }
    }


    async getStaff(req: Request, res: Response){
        const admin = (req as any).user;
        const staffUsers: { id: string; username: string; role: string; resto: string }[] = [];
        if (!admin) return res.status(401).json({ message: "Unauthorized" });
        if (admin.role !== "admin") {
            return res.status(403).json({ message: "Only admin can get staff" });
        }

        try {
            for(const staff of admin.my_staff){
                const staffUser = await User.findById(staff);
                if(!staffUser) return res.status(404).json({ message: "Staff not found" });
                staffUsers.push({
                    id: staffUser.id,
                    username: staffUser.username,
                    role: staffUser.role,
                    resto: staffUser.resto.toString()
                });
            }
            return res.status(200).json({
                message: "Staff fetched successfully",
                staff: staffUsers
            });
        } catch (err) {
            return res.status(500).json({ message: "Internal error", error: (err as Error).message });
        }
    }
    
    async deleteStaff(req: Request, res: Response){
        const admin = (req as any).user;
        const staffId = (req.body as { id: string }).id;
        if (!admin) return res.status(401).json({ message: "Unauthorized" });
        if (admin.role !== "admin") {
            return res.status(403).json({ message: "Only admin can delete staff" });
        }
        try {
            const staff = await User.findById(staffId);
            if(!staff) return res.status(404).json({ message: "Staff not found" });
            await staff.deleteOne();
            admin.my_staff = admin.my_staff.filter((staff: any) => staff._id.toString() !== staffId);
            await admin.save();
            return res.status(200).json({ message: "Staff deleted successfully" });
        } catch (err) {
            return res.status(500).json({ message: "Internal error", error: (err as Error).message });
        }
    }

    async resetPasswordStaff(req: Request, res: Response){
        const admin = (req as any).user;
        const { id, password } = req.body;
        const staffId = id;
        if (!admin) return res.status(401).json({ message: "Unauthorized" });
        if (admin.role !== "admin") {
            return res.status(403).json({ message: "Only admin can reset password staff" });
        }
        try {
            const staff = await User.findById(staffId);
            if(!staff) return res.status(404).json({ message: "Staff not found" });
            const salt = await bcrypt.genSalt(10);
            const hash = await bcrypt.hash(password, salt);
            staff.hash = hash;
            await staff.save();
            return res.status(200).json({ message: "Password reset successfully" });
        } catch (err) {
            return res.status(500).json({ message: "Internal error", error: (err as Error).message });
        }
    }

    async getUsers(req: Request, res: Response) {
        try {
            const authHeader = req.headers.authorization || "";
            const token = authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : "";

            if (!token || token !== (process.env.BACKEND_KEY || "")) {
                return res.status(401).json({ message: "Unauthorized" });
            }

            const users = await User.find({}, { hash: 0, session: 0 })
                .populate({ path: "restos", select: "slug name" })
                .populate({ path: "resto", select: "slug name" })
                .sort({ username: 1 });

            const safeUsers = users.map((u: any) => {
                const restosIds = Array.isArray(u.restos)
                    ? u.restos.map((r: any) => (r?._id != null ? r._id.toString() : String(r)))
                    : [];

                const restoRef = u.resto;
                const restoId =
                    restoRef && typeof restoRef === "object" && restoRef._id != null
                        ? restoRef._id.toString()
                        : restoRef
                          ? String(restoRef)
                          : null;

                const primaryRestoId =
                    restosIds.length > 0 ? restosIds[0] : restoId || "";

                let slug = "";
                if (Array.isArray(u.restos) && u.restos.length > 0) {
                    const first = u.restos[0];
                    if (first && typeof first === "object" && first.slug) slug = first.slug;
                } else if (restoRef && typeof restoRef === "object" && restoRef.slug) {
                    slug = restoRef.slug;
                }

                return {
                    id: u._id?.toString?.() || u.id,
                    username: u.username,
                    email: u.email,
                    role: u.role,
                    restos: restosIds,
                    resto: restoId,
                    primaryRestoId,
                    slug,
                    my_staff: Array.isArray(u.my_staff)
                        ? u.my_staff.map((x: any) => (x?._id != null ? x._id.toString() : String(x)))
                        : [],
                };
            });

            return res.status(200).json({ users: safeUsers });
        } catch (err) {
            return res.status(500).json({ message: "Internal error", error: (err as Error).message });
        }
    }

    async updateUser(req: Request, res: Response) {
        try {
            const authHeader = req.headers.authorization || "";
            const token = authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : "";
            if (!token || token !== (process.env.BACKEND_KEY || "")) {
                return res.status(401).json({ message: "Unauthorized" });
            }

            const { id } = req.params;
            const { username, email, role, resto } = req.body as {
                username?: string;
                email?: string;
                role?: "admin" | "staff";
                resto?: string | null;
            };

            const user = await User.findById(id);
            if (!user) return res.status(404).json({ message: "User not found" });

            if (username && username !== user.username) {
                const usernameExists = await User.findOne({ username });
                if (usernameExists) {
                    return res.status(409).json({ message: "Username already in use" });
                }
                user.username = username;
            }

            if (email && email !== user.email) {
                const emailExists = await User.findOne({ email });
                if (emailExists) {
                    return res.status(409).json({ message: "Email already in use" });
                }
                user.email = email;
            }

            if (role && (role === "admin" || role === "staff")) {
                user.role = role;
            }

            if (typeof resto === "string" && resto.trim()) {
                if (!mongoose.Types.ObjectId.isValid(resto)) {
                    return res.status(400).json({ message: "Invalid resto ID format" });
                }
                user.resto = new mongoose.Types.ObjectId(resto);
            }

            await user.save();

            const populated = await User.findById(user._id)
                .populate({ path: "restos", select: "slug name" })
                .populate({ path: "resto", select: "slug name" })
                .lean();

            const u: any = populated || user;
            const restosIds = Array.isArray(u.restos)
                ? u.restos.map((r: any) => (r?._id != null ? r._id.toString() : String(r)))
                : [];
            const restoRef = u.resto;
            const restoIdStr =
                restoRef && typeof restoRef === "object" && restoRef._id != null
                    ? restoRef._id.toString()
                    : restoRef
                      ? String(restoRef)
                      : null;
            const primaryRestoId = restosIds.length > 0 ? restosIds[0] : restoIdStr || "";
            let slug = "";
            if (Array.isArray(u.restos) && u.restos.length > 0) {
                const first = u.restos[0];
                if (first && typeof first === "object" && first.slug) slug = first.slug;
            } else if (restoRef && typeof restoRef === "object" && restoRef.slug) {
                slug = restoRef.slug;
            }

            return res.status(200).json({
                message: "User updated successfully",
                user: {
                    id: user._id?.toString?.() || user.id,
                    username: user.username,
                    email: user.email,
                    role: user.role,
                    restos: restosIds,
                    resto: restoIdStr,
                    primaryRestoId,
                    slug,
                    my_staff: Array.isArray(u.my_staff)
                        ? u.my_staff.map((x: any) => (x?._id != null ? x._id.toString() : String(x)))
                        : [],
                },
            });
        } catch (err) {
            return res.status(500).json({ message: "Internal error", error: (err as Error).message });
        }
    }

    async resetUserPassword(req: Request, res: Response) {
        try {
            const authHeader = req.headers.authorization || "";
            const token = authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : "";
            if (!token || token !== (process.env.BACKEND_KEY || "")) {
                return res.status(401).json({ message: "Unauthorized" });
            }

            const { id } = req.params;
            const { password } = req.body as { password?: string };
            if (!password || password.length < 4) {
                return res.status(400).json({ message: "Password is required (min 4 chars)" });
            }

            const user = await User.findById(id);
            if (!user) return res.status(404).json({ message: "User not found" });

            const salt = await bcrypt.genSalt(10);
            const hash = await bcrypt.hash(password, salt);
            user.hash = hash;
            await user.save();

            return res.status(200).json({ message: "Password reset successfully" });
        } catch (err) {
            return res.status(500).json({ message: "Internal error", error: (err as Error).message });
        }
    }
    
}

export default new authController();