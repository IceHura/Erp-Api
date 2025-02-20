import mongoose, { Document, Schema } from "mongoose";
import { Order } from "./Order";

export interface IClient extends Document {
    name: string;
    address: string;
    email: string;
    phone: string;
    purchaseHistory: mongoose.Types.ObjectId[];
    isActive: boolean;
}

const ClientSchema = new Schema<IClient>(
    {
        name: { type: String, required: true },
        address: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        phone: { type: String, required: true },
        purchaseHistory: [{ type: mongoose.Schema.Types.ObjectId, ref: "Order" }],
        isActive: { type: Boolean, default: true },
    },
    { timestamps: true }
);

export const Client = mongoose.model<IClient>("Client", ClientSchema);
