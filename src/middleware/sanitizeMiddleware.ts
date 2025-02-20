import { Request, Response, NextFunction } from "express";
import sanitize from "mongo-sanitize";

export const sanitizeRequest = (req: Request, res: Response, next: NextFunction): void => {
    try {
        if (req.body) {
            req.body = sanitize(req.body);
            console.log("req.body", req.body);
        }

        if (req.query) {
            req.query = sanitize(req.query);
            console.log("req.query", req.query);
        }

        if (req.params) {
            req.params = sanitize(req.params);
            console.log("req.params", req.params);
        }

        next();
    } catch (error) {
        res.status(400).json({ message: "Invalid input data" });
    }
};
