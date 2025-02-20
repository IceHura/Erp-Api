import mongoose from "mongoose";

interface IProduct extends mongoose.Document {
  name: string;
  description: string;
  price: number;
  stock: number;
}

const ProductSchema = new mongoose.Schema<IProduct>(
  {
    name: { type: String, required: true, unique: true },
    description: { type: String },
    price: { type: Number, required: true },
    stock: { type: Number, required: true, default: 0 },
  },
  { timestamps: true }
);

export const Product = mongoose.model<IProduct>("Product", ProductSchema);
