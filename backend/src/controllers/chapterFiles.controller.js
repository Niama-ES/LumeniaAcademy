import chapterFilesService from "../services/chapterFiles.service.js";
import { success, error } from "../utils/response.js";

function ensureUser(req, res) {
  const user = req.user;
  if (!user) return { ok: false, res: error(res, 401, "Unauthorized") };
  return { ok: true, user };
}

export async function uploadFile(req, res, next) {
  try {
    const check = ensureUser(req, res);
    if (!check.ok) return;

    if (!req.file) return error(res, 400, "No file uploaded");

    const chapterId = Number(req.params.chapterId);
    if (Number.isNaN(chapterId)) return error(res, 400, "chapterId must be a number");

    const fileRecord = await chapterFilesService.uploadFile({
      chapterId,
      file: req.file,
      actor: { id: check.user.id, role: check.user.role },
    });

    return success(res, 201, { file: fileRecord });
  } catch (err) {
    next(err);
  }
}

export async function listFiles(req, res, next) {
  try {
    const check = ensureUser(req, res);
    if (!check.ok) return;

    const chapterId = Number(req.params.chapterId);
    if (Number.isNaN(chapterId)) return error(res, 400, "chapterId must be a number");

    const files = await chapterFilesService.listFiles({ chapterId });
    return success(res, 200, { files });
  } catch (err) {
    next(err);
  }
}

export async function deleteFile(req, res, next) {
  try {
    const check = ensureUser(req, res);
    if (!check.ok) return;

    const fileId = Number(req.params.fileId);
    if (Number.isNaN(fileId)) return error(res, 400, "fileId must be a number");

    await chapterFilesService.deleteFile({
      fileId,
      actor: { id: check.user.id, role: check.user.role },
    });

    return success(res, 200, { message: "File deleted" });
  } catch (err) {
    next(err);
  }
}
