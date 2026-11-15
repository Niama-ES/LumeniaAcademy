import express from "express";
import cors from "cors";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";
import { errorMiddleware } from "./middlewares/error.middleware.js";
import { ok } from "./utils/response.js";
import adminRoutes from "./routes/admin.routes.js";
import announcementsRoutes from "./routes/announcements.routes.js";
import authRoutes from "./routes/auth.routes.js";
import chaptersRoutes from "./routes/chapters.routes.js";
import consultationsRoutes from "./routes/consultations.routes.js";
import coursesRoutes from "./routes/courses.routes.js";
import teacherStatsRoutes from "./routes/teacherStats.routes.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export function createApp() {
  const app = express();

  // middleware
  app.use(cors());
  app.use(express.json({ limit: "1mb" }));
  app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

  // Serve uploaded files
  app.use("/uploads", express.static(path.join(__dirname, "../../uploads")));

  // healthcheck
  app.get("/health", (req, res) => ok(res, { status: "up" }, "Healthy"));

  // Define a default route for the root path
  app.get("/", (req, res) => {
    res.status(200).json({
      success: true,
      message: "Welcome to Lumenia Academy API!",
    });
  });

  // mount routes here (your teammates will plug theirs)
  app.use("/api/admin", adminRoutes);
  app.use("/api/announcements", announcementsRoutes);
  app.use("/api/auth", authRoutes);
  app.use("/api/chapters", chaptersRoutes);
  app.use("/api/consultations", consultationsRoutes);
  app.use("/api/courses", coursesRoutes);
  app.use("/api/teacher-stats", teacherStatsRoutes);

  // 404 handler
  app.use((req, res) => {
    const err = new Error(`Route not found: ${req.method} ${req.originalUrl}`);
    err.status = 404;
    err.code = "NOT_FOUND";
    throw err;
  });

  // error handler (must be last)
  app.use(errorMiddleware);

  return app;
}