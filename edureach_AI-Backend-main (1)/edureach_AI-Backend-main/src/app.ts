import express from "express";
import type { Application, Request, Response } from "express";
import cors from "cors";

import authRoutes from "./routes/auth.routes.ts";
import chatRoutes from "./routes/chat.routes.ts";
import vapiRoutes from "./routes/vapi.routes.ts";

import errorHandler from "./middleware/error-handler.middleware.ts";

const app: Application = express();

// Middleware
app.use(
  cors({
    origin: (origin, callback) => {
      const allowed = (process.env.CLIENT_URLS || "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      if (!origin) return callback(null, true);
      if (allowed.includes(origin)) return callback(null, true);

      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/vapi", vapiRoutes);

// Health Check
app.get("/", (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "EduReach API is running",
  });
});

// 404 Handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// Global Error Handler
app.use(errorHandler);

export default app;