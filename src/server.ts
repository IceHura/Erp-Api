import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import connectDB from "./config/db";
import userRoutes from "./routes/userRoutes";
import productRoutes from "./routes/productRoutes";
import { errorHandler } from "./middleware/errorMiddleware";
import orderRoutes from "./routes/orderRoutes";
import { setupSwagger } from "./config/swagger";
import analyticsRoutes from "./routes/analyticsRoutes";
import clientRoutes from "./routes/clientRoutes";
import { initializeAdmin } from "./utils/initAdmin";
import { sanitizeRequest } from "./middleware/sanitizeMiddleware";

dotenv.config();
const app = express();

connectDB();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
  origin: ["http://localhost:5000", "http://localhost:5000/api-docs"],
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));

app.use(helmet());

app.use(errorHandler);
setupSwagger(app);
app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/clients", clientRoutes);

app.get("/", (req, res) => {
  res.send("ERP API is running!");
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await initializeAdmin();
    app.listen(PORT, () => console.log(`🚀 Server is running on port ${PORT}`));
  } catch (error) {
    console.error("❌ Error starting server:", error);
  }
};

startServer();