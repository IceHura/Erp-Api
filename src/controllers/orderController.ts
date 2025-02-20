import { Request, Response, NextFunction } from "express";
import { Order, OrderStatus } from "../models/Order";
import { Product } from "../models/Product";
import { AuthRequest } from "../types/AuthRequest";
import { Client } from "../models/Client";

export const getOrders = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authReq = req as AuthRequest;
  
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const skip = (page - 1) * limit;
  
      const total = await Order.countDocuments();
      const orders = await Order.find()
        .populate("items.product")
        .skip(skip)
        .limit(limit)
        .exec();
  
      res.json({
        orders,
        total,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
      });
    } catch (error) {
      next(error);
    }
};

export const getOrderById = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const order = await Order.findById(req.params.id).populate("items.product");
  
      if (!order) {
        res.status(404);
        return next(new Error("Order not found"));
      }
  
      res.json(order);
    } catch (error) {
        next(error);
    }
};

export const createOrder = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { clientId, items } = req.body;

        if (!clientId) {
            res.status(400);
            return next(new Error("Client ID is required"));
        }

        if (!items || items.length === 0) {
            res.status(400);
            return next(new Error("Order must have at least one product"));
        }

        const client = await Client.findById(clientId);
        if (!client) {
            res.status(404);
            return next(new Error("Client not found"));
        }

        let total = 0;
        const updatedItems: { product: string; quantity: number; price: number }[] = [];
        const productUpdates: { productId: string; newStock: number }[] = [];

        for (const item of items) {
            const product = await Product.findById(item.product);
            if (!product) {
                res.status(404);
                return next(new Error(`Product with ID ${item.product} not found`));
            }

            if (product.stock < item.quantity) {
                res.status(400);
                return next(new Error(`Insufficient stock for product ${item.product}. Needed: ${item.quantity}, Available: ${product.stock}`));
            }

            const itemPrice = product.price;
            updatedItems.push({ product: product.id, quantity: item.quantity, price: itemPrice }); 
            productUpdates.push({ productId: product.id, newStock: product.stock - item.quantity });
            total += itemPrice * item.quantity;
        }

        const order = new Order({
            client: clientId,
            items: updatedItems, 
            total,
            status: OrderStatus.PENDING
        });

        await order.save();
        
        for (const update of productUpdates) {
            await Product.findByIdAndUpdate(update.productId, { stock: update.newStock });
        }

        client.purchaseHistory.push(order.id);
        await client.save();

        res.status(201).json({ message: "Order created successfully", order });
    } catch (error) {
        next(error);
    }
};

export const cancelOrder = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const order = await Order.findById(req.params.id);

        if (!order) {
            res.status(404);
            return next(new Error("Order not found"));
        }

        if (order.status === OrderStatus.SHIPPED || order.status === OrderStatus.DELIVERED) {
            res.status(400);
            return next(new Error("Cannot cancel a shipped or delivered order"));
        }

        for (const item of order.items) {
            await Product.findByIdAndUpdate(item.product, { $inc: { stock: item.quantity } });
        }

        await Client.findByIdAndUpdate(order.client, { $pull: { purchaseHistory: order._id } });

        order.status = OrderStatus.CANCELLED;
        await order.save();

        res.json({ message: "Order canceled successfully", order });
    } catch (error) {
        next(error);
    }
};

export const updateOrderStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { status } = req.body;
        const order = await Order.findById(req.params.id);

        if (!order) {
            res.status(404);
            return next(new Error("Order not found"));
        }

        if (!Object.values(OrderStatus).includes(status)) {
            res.status(400);
            return next(new Error("Invalid status"));
        }

        order.status = status;
        await order.save();

        res.json({ message: "Order status updated", order });
    } catch (error) {
        next(error);
    }
};

export const deleteOrder = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const order = await Order.findById(req.params.id);
      if (!order) {
        res.status(404);
        return next(new Error("Order not found"));
      }
  
      await order.deleteOne();
      res.json({ message: "Order deleted successfully" });
    } catch (error) {
      next(error);
    }
};