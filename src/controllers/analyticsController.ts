import { Request, Response, NextFunction } from "express";
import { Order, OrderStatus } from "../models/Order";
import { Product } from "../models/Product";

export const getTotalRevenue = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        let { from, to } = req.query;

        if (!to) {
            to = new Date().toISOString();
        }
        if (!from) {
            from = new Date(0).toISOString();
        }

        if (new Date(from as string) > new Date(to as string)) {
            res.status(400);
            return next(new Error("'from' date cannot be greater than 'to' date"));
        }

        const orders = await Order.find({
            status: { $ne: OrderStatus.CANCELLED },
            createdAt: { $gte: new Date(from as string), $lte: new Date(to as string) }
        });

        const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);

        res.json({ totalRevenue, from, to });
    } catch (error) {
        next(error);
    }
};

export const getClientRevenue = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { clientId } = req.params;

        const orders = await Order.find({
            client: clientId,
            status: { $ne: OrderStatus.CANCELLED }
        });

        const clientRevenue = orders.reduce((sum, order) => sum + order.total, 0);

        res.json({ clientId, clientRevenue });
    } catch (error) {
        next(error);
    }
};


export const getStockReport = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const products = await Product.find({}, "name stock");

        res.json({ products });
    } catch (error) {
        next(error);
    }
};
