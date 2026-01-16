import { Request, Response } from "express";
import bcrypt from "bcrypt";
import User from "../models/User.js";
import AuthJwt from "../middlewares/AuthJwt.js";

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
                    restos:user.restos
                },
                token
            }
        );
    }

    async register(req: Request, res: Response){
        const {username, email, password } = req.body;

        if(!username || !email || !password) return res.status(401).json({ message: "Missing required fields" });
        
        const userEmail = await User.findOne({ email });
        if(userEmail) return res.status(401).json({ message: "User with this email already exists" });
        const userUsername = await User.findOne({ username });
        if(userUsername) return res.status(401).json({ message: "User with this username already exists" });
       
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(password, salt);
        await User.create({ username, email, hash });
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
        const { email, password } = req.body;
        const user = await User.findOne({ email });
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
                    restos:user.restos
                },
                token
            }
        );
    }

}

export default new authController();