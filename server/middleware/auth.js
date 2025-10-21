// It will execute before executing controller func

import jwt from "jsonwebtoken";
import User from "../models/User.js";

// Middleware to protect routes
export const protectRoute = async (req, res, next) => {
    try {
        
        const token = req.headers.token;

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // It will remove the password
        const user = await User.findById(decoded.userId).select("-password");
        
        if(!user){
            return res.json({success: false, message: "User not found"});
        }
        
        // Now it will go to controller func
        req.user = user;
        next();

    } catch (error) {
        console.log(error.message);
        return res.json({success: false, message: error.message});
    }
}
