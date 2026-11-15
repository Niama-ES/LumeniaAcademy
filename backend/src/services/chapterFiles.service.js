import fs from "fs";
import path from "path";
import chapterFileModel from "../models/chapterFile.model.js";
import chapterModel from "../models/chapter.model.js";
import { UPLOADS_DIR } from "../config/upload.js";

function httpError(statusCode, message) {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
}

function requireTeacher(actor) {
  if (!actor || !actor.id) throw httpError(401, "Unauthorized");
  if (actor.role !== "TEACHER") throw httpError(403, "Forbidden");
}

export async function uploadFile({ chapterId, file, actor }) {
  requireTeacher(actor);

  const ownerId = await chapterModel.getCourseOwnerIdByChapter(chapterId);
  if (!ownerId) throw httpError(404, "Chapter not found");
  if (ownerId !== actor.id) throw httpError(403, "You can only add files to your own chapters");

  return chapterFileModel.create({
    chapterId,
    originalName: file.originalname,
    storedName: file.filename,
    mimetype: file.mimetype,
    size: file.size,
  });
}

export async function listFiles({ chapterId }) {
  return chapterFileModel.listByChapter(chapterId);
}

export async function deleteFile({ fileId, actor }) {
  requireTeacher(actor);

  const fileRecord = await chapterFileModel.getById(fileId);
  if (!fileRecord) throw httpError(404, "File not found");

  const ownerId = await chapterModel.getCourseOwnerIdByChapter(fileRecord.chapter_id);
  if (!ownerId) throw httpError(404, "Chapter not found");
  if (ownerId !== actor.id) throw httpError(403, "You can only delete files from your own chapters");

  // Delete from disk
  const filePath = path.join(UPLOADS_DIR, fileRecord.stored_name);
  try {
    fs.unlinkSync(filePath);
  } catch (e) {
    // File may already be missing — continue with DB cleanup
    console.warn("Could not delete file from disk:", e.message);
  }

  await chapterFileModel.remove(fileId);
}

export default { uploadFile, listFiles, deleteFile };
