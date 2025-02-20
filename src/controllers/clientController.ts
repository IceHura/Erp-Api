import { Request, Response, NextFunction } from "express";
import { Client } from "../models/Client";
import { Order, OrderStatus } from "../models/Order";
import { AuthRequest } from "../types/AuthRequest";

export const createClient = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { name, address, email, phone } = req.body;

        const existingClient = await Client.findOne({ email });
        if (existingClient) {
            res.status(400);
            return next(new Error("Client with this email already exists"));
        }

        const client = new Client({ name, address, email, phone });
        await client.save();

        res.status(201).json({ message: "Client created successfully", client });
    } catch (error) {
        next(error);
    }
};

export const getClientOrderHistory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { clientId } = req.params;
        console.log("req.params --- ", req.params);
        const client = await Client.findById(clientId);
        if (!client) {
            res.status(404);
            return next(new Error("Client not found"));
        }

        const orders = await Order.find({
            client: clientId,
            status: { $ne: OrderStatus.CANCELLED }
        }).populate("items.product");

        res.json(orders);
    } catch (error) {
        next(error);
    }
};

export const updateClient = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const authReq = req as AuthRequest;
        const { name, address, email, phone, isActive } = req.body;

        const client = await Client.findById(req.params.id);
        if (!client) {
            res.status(404);
            return next(new Error("Client not found"));
        }

        if (isActive !== undefined && authReq.user?.role !== "admin") {
            res.status(403);
            return next(new Error("You are not authorized to change client status"));
        }

        client.name = name || client.name;
        client.address = address || client.address;
        client.email = email || client.email;
        client.phone = phone || client.phone;
        if (isActive !== undefined) {
            client.isActive = isActive;
        }

        await client.save();
        res.json({ message: "Client updated successfully", client });
    } catch (error) {
        next(error);
    }
};

export const getActiveClients = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const clients = await Client.find({ isActive: true }).select("-purchaseHistory");
        res.json(clients);
    } catch (error) {
        next(error);
    }
};

export const addOrderToClient = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { id } = req.params;
        const { orderId } = req.body;

        const client = await Client.findById(id);
        if (!client) {
            res.status(404);
            return next(new Error("Client not found"));
        }

        const order = await Order.findById(orderId);
        if (!order) {
            res.status(404);
            return next(new Error("Order not found"));
        }

        client.purchaseHistory.push(orderId);
        await client.save();

        res.json({ message: "Order added to client history", client });
    } catch (error) {
        next(error);
    }
};

export const removeOrderFromClient = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { id, orderId } = req.params;

        const client = await Client.findById(id);
        if (!client) {
            res.status(404);
            return next(new Error("Client not found"));
        }

        client.purchaseHistory = client.purchaseHistory.filter(
            (order) => order.toString() !== orderId
        );

        await client.save();

        res.json({ message: "Order removed from client history", client });
    } catch (error) {
        next(error);
    }
};
