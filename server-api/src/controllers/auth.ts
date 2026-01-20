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
        const {username, email, password ,resto  } = req.body;

        if(!username || !email || !password || !resto ) return res.status(401).json({ message: "Missing required fields" });
        
        const userEmail = await User.findOne({ email });
        if(userEmail) return res.status(401).json({ message: "User with this email already exists" });
        const userUsername = await User.findOne({ username });
        if(userUsername) return res.status(401).json({ message: "User with this username already exists" });
       
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(password, salt);
        await User.create({ username, email, hash, role: "admin" , resto: new mongoose.Types.ObjectId(resto) });
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
    
}

export default new authController();