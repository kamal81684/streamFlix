import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.routes.js";
import errorHandler from "./middleware/error.middleware.js";
import userRoutes from "./routes/user.routes.js";
import path from "path";

const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());
app.use("/api/auth", authRoutes);
app.use("/uploads", express.static(path.join("uploads")));
app.use("/api/users", userRoutes);
app.use(errorHandler);

export default app;