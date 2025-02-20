import { Request, Response, NextFunction, RequestHandler } from "express";
import jwt from "jsonwebtoken";
import { AuthRequest } from "../types/AuthRequest";
import { User, UserRole } from "../models/User";
import { isBlacklisted } from "../utils/blacklist";

export const protect = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const authReq = req as AuthRequest;
        
        let token = authReq.headers.authorization?.split(" ")[1];

        if (!token) {
            res.status(401).json({ message: "Not authorized, no token" });
            return;
        }

        if (isBlacklisted(token)) {
            res.status(401).json({ message: "Token is revoked" });
            return;
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string };
        const user = await User.findById(decoded.id).select("-password");

        if (!user) {
            res.status(401).json({ message: "User not found" });
            return;
        }

        authReq.user = user;
        console.log("User in request:", authReq.user);
        next();
    } catch (error) {
        res.status(401).json({ message: "Not authorized" });
    }
};

export const authorizeRoles = (roles: UserRole[]): RequestHandler => {
    return (req: Request, res: Response, next: NextFunction): void => {
        const authReq = req as AuthRequest;

        if (!authReq.user || !roles.includes(authReq.user.role)) {
            res.status(403).json({ message: "Access denied" });
            return;
        }

        next();
    };
};