import { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../models/User";
import { addToBlacklist } from "../utils/blacklist";
import { AuthRequest } from "../types/AuthRequest";

const secret = process.env.JWT_SECRET || "supersecretkey";
const refreshSecret = process.env.JWT_REFRESH_SECRET || "supersecretkey";

const generateAccessToken = (userId: string, role: string) => {
    return jwt.sign({ id: userId, role }, secret, { expiresIn: "1h" });
};
  
const generateRefreshToken = (userId: string) => {
    return jwt.sign({ id: userId }, refreshSecret, { expiresIn: "1d" });
};

export const registerUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    return next(new Error("All fields are required"));
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = new User({ name, email, password: hashedPassword, role });

  console.log("Saving user:", user);
  await user.save();

  res.status(201).json({ message: "User successfully registered" });
};

export const getUsers = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  const users = await User.find().select("-password");
  res.json(users);
};

export const loginUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { email, password } = req.body;
  
    const user = await User.findOne({ email });
    if (!user) {
      res.status(401);
      return next(new Error("Invalid email or password"));
    }
  
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(401);
      return next(new Error("Invalid email or password"));
    }
  
    const accessToken = generateAccessToken(user._id.toString(), user.role);
    const refreshToken = generateRefreshToken(user._id.toString());
  
    user.refreshToken = refreshToken;
    await user.save();
  
    res.json({ message: "Login successful", accessToken, refreshToken });
};

export const refreshToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      res.status(401);
      return next(new Error("Refresh token is required"));
    }
  
    const user = await User.findOne({ refreshToken });
    if (!user) {
      res.status(403);
      return next(new Error("Invalid refresh token"));
    }
  
    try {
      const decoded = jwt.verify(refreshToken, refreshSecret) as { id: string };
      const newAccessToken = generateAccessToken(decoded.id, user.role);
      const newRefreshToken = generateRefreshToken(decoded.id);
  
      user.refreshToken = newRefreshToken;
      await user.save();
  
      res.json({ accessToken: newAccessToken, refreshToken: newRefreshToken });
    } catch (error) {
      res.status(403);
      return next(new Error("Invalid refresh token"));
    }
};

export const logoutUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            res.status(400);
            return next(new Error("Access token is required"));
        }

        const accessToken = authHeader.split(" ")[1];

        const user = await User.findOne({ accessToken });
        if (user) {
            user.refreshToken = "";
            await user.save();
        }

        addToBlacklist(accessToken);

        res.json({ message: "Logout successful" });
    } catch (error) {
        next(error);
    }
};

export const updateUserRole = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
      const authReq = req as AuthRequest;
      const { role } = req.body;
      const { id } = req.params;

      if (authReq.user?.role !== "admin") {
          res.status(403);
          return next(new Error("You are not authorized to update roles"));
      }

      const validRoles = ["user", "manager", "admin"];
      if (!validRoles.includes(role)) {
          res.status(400);
          return next(new Error("Invalid role provided"));
      }

      const user = await User.findById(id);
      if (!user) {
          res.status(404);
          return next(new Error("User not found"));
      }

      user.role = role;
      await user.save();

      res.json({ message: "User role updated successfully", user });
  } catch (error) {
      next(error);
  }
};