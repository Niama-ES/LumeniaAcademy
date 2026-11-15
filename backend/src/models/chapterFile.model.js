import db, { runWithRetry } from "../config/db.js";

function isBetterSqlite3(instance) {
  return (
    instance &&
    typeof instance.prepare === "function" &&
    typeof instance.serialize !== "function"
  );
}

async function run(sql, params = []) {
  if (isBetterSqlite3(db)) {
    const info = db.prepare(sql).run(params);
    return Promise.resolve(info);
  }
  try {
    return await runWithRetry(sql, params);
  } catch (err) {
    if (err && err.code === "SQLITE_BUSY") {
      const e = new Error("DATABASE_BUSY");
      e.status = 503;
      throw e;
    }
    throw err;
  }
}

function get(sql, params = []) {
  if (isBetterSqlite3(db)) {
    return Promise.resolve(db.prepare(sql).get(params));
  }
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) return reject(err);
      resolve(row);
    });
  });
}

function all(sql, params = []) {
  if (isBetterSqlite3(db)) {
    return Promise.resolve(db.prepare(sql).all(params));
  }
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });
}

export async function create({ chapterId, originalName, storedName, mimetype, size }) {
  const sql = `
    INSERT INTO chapter_files (chapter_id, original_name, stored_name, mimetype, size)
    VALUES (?, ?, ?, ?, ?)
  `;
  const info = await run(sql, [chapterId, originalName, storedName, mimetype, size]);
  return get(`SELECT * FROM chapter_files WHERE id = ?`, [info.lastInsertRowid]);
}

export async function listByChapter(chapterId) {
  return all(
    `SELECT * FROM chapter_files WHERE chapter_id = ? ORDER BY created_at ASC`,
    [chapterId]
  );
}

export async function getById(fileId) {
  return get(`SELECT * FROM chapter_files WHERE id = ?`, [fileId]);
}

export async function remove(fileId) {
  const info = await run(`DELETE FROM chapter_files WHERE id = ?`, [fileId]);
  return info.changes;
}

export default { create, listByChapter, getById, remove };
