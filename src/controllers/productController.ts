import { Request, Response, NextFunction } from "express";
import { Product } from "../models/Product";

export const createProduct = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { name, description, price, stock } = req.body;

  const existingProduct = await Product.findOne({ name });
  if (existingProduct) {
    res.status(400);
    return next(new Error("Product with this name already exists"));
  }

  const product = new Product({ name, description, price, stock });
  await product.save();

  res.status(201).json({ message: "Product created successfully", product });
};

export const getProducts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      let query = Product.find();
  
      if (req.query.name) {
        query = query.where("name").regex(new RegExp(req.query.name as string, "i"));
      }
      if (req.query.minPrice) {
        query = query.where("price").gte(Number(req.query.minPrice));
      }
      if (req.query.maxPrice) {
        query = query.where("price").lte(Number(req.query.maxPrice));
      }
      if (req.query.minStock || req.query.stock) {
        const minStock = Number(req.query.minStock || req.query.stock);
        query = query.where("stock").gte(minStock);
      }
  
      if (req.query.sort) {
        const sortField = req.query.sort.toString().replace(/[^a-zA-Z0-9_-]/g, "");
        query = query.sort(sortField);
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const skip = (page - 1) * limit;
  
      const total = await Product.countDocuments(query.getFilter());
      const products = await query.skip(skip).limit(limit).exec();
  
      res.json({
        products,
        total,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
      });
    } catch (error) {
      next(error);
    }
  };
  

export const getProductById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    return next(new Error("Product not found"));
  }
  res.json(product);
};

export const updateProduct = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { name, description, price, stock } = req.body;

  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    return next(new Error("Product not found"));
  }

  product.name = name || product.name;
  product.description = description || product.description;
  product.price = price || product.price;
  product.stock = stock || product.stock;

  await product.save();
  res.json({ message: "Product updated successfully", product });
};

export const deleteProduct = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    return next(new Error("Product not found"));
  }

  await product.deleteOne();
  res.json({ message: "Product deleted successfully" });
};

