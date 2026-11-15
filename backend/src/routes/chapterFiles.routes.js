import express from "express";
import * as chapterFilesController from "../controllers/chapterFiles.controller.js";
import auth from "../middlewares/auth.middleware.js";
import requireRole from "../middlewares/role.middleware.js";
import { upload } from "../config/upload.js";

const router = express.Router({ mergeParams: true }); // mergeParams to access :chapterId

/**
 * TEACHER: upload a file to a chapter
 * POST /api/chapters/:chapterId/files
 */
router.post(
  "/",
  auth,
  requireRole("TEACHER"),
  upload.single("file"),
  chapterFilesController.uploadFile
);

/**
 * Any authenticated user: list files for a chapter
 * GET /api/chapters/:chapterId/files
 */
router.get("/", auth, chapterFilesController.listFiles);

/**
 * TEACHER: delete a file
 * DELETE /api/chapters/:chapterId/files/:fileId
 */
router.delete(
  "/:fileId",
  auth,
  requireRole("TEACHER"),
  chapterFilesController.deleteFile
);

export default router;
