import userModel from "../models/user.model.js";
import AuditService from "./audit.service.js";
import { hashPassword, comparePassword } from "../utils/hash.js";
import { signToken } from "../utils/jwt.js";

export async function register({ name, email, password, role }) {
  const existing = await userModel.findByEmail(email);
  if (existing) {
    const err = new Error("USER_ALREADY_EXISTS");
    err.status = 400;
    throw err;
  }

  // Normalize and validate role (accept common casings/aliases in dev)
  const ALLOWED = new Set(["STUDENT", "TEACHER", "ADMIN"]);
  let normalizedRole = (typeof role === "string" ? role.trim().toUpperCase() : "STUDENT");

  // Accept a few friendly aliases (e.g. 'student' or 'Student') by normalization above
  if (!ALLOWED.has(normalizedRole)) {
    const err = new Error("INVALID_ROLE");
    err.status = 400;
    err.details = { allowed: Array.from(ALLOWED) };
    throw err;
  }

  const password_hash = await hashPassword(password);

  let user;
  try {
    user = await userModel.create({ name, email, password_hash, role: normalizedRole });
  } catch (dbErr) {
    // Translate common SQLite constraint errors into friendly HTTP errors
    if (dbErr && dbErr.code === "SQLITE_CONSTRAINT") {
      const err = new Error("INVALID_PAYLOAD");
      err.status = 400;
      err.details = { message: dbErr.message };
      throw err;
    }
    throw dbErr;
  }

  const token = signToken({ sub: user.id, role: user.role });

  // best-effort audit (do not block registration on audit failure)
  try {
    await AuditService.logLoginSuccess({ req: null, userId: user.id, email: user.email });
  } catch (e) {
    // noop
  }

  return { token, user };
}

export async function login({ email, password }) {
  const user = await userModel.findByEmail(email);
  if (!user) {
    try {
      await AuditService.logLoginFailed({ req: null, email, reason: "NOT_FOUND" });
    } catch (e) {}
    const err = new Error("INVALID_CREDENTIALS");
    err.status = 401;
    throw err;
  }

  // Development convenience: support placeholder hashes (e.g. "HASH_TEACHER") that
  // exist in the provided sqlite seed. This is ONLY allowed when not in production.
  let ok = false;
  const isPlaceholder = typeof user.password_hash === "string" && user.password_hash.startsWith("HASH_");

  if (process.env.NODE_ENV !== "production" && isPlaceholder) {
    // Accept either the literal placeholder (what you tried in Postman) or the suffix
    // (e.g. `HASH_TEACHER` -> allow `TEACHER`) or a DEV_MASTER_PASSWORD override.
    const suffix = user.password_hash.slice(5);
    ok = password === user.password_hash || password === suffix || (process.env.DEV_MASTER_PASSWORD && password === process.env.DEV_MASTER_PASSWORD);

    if (ok) {
      // best-effort audit for dev-path success
      try {
        await AuditService.logLoginSuccess({ req: null, userId: user.id, email });
      } catch (e) {}
    }
  } else {
    ok = await comparePassword(password, user.password_hash);
  }

  if (!ok) {
    try {
      await AuditService.logLoginFailed({ req: null, email, reason: "INVALID_PASSWORD" });
    } catch (e) {}
    const err = new Error("INVALID_CREDENTIALS");
    err.status = 401;
    throw err;
  }

  if (!user.is_active) {
    const err = new Error("USER_INACTIVE");
    err.status = 403;
    throw err;
  }

  const token = signToken({ sub: user.id, role: user.role });
  return { token, user: { id: user.id, name: user.name, email: user.email, role: user.role } };
}

export async function updateProfile({ userId, name }) {
  if (!name || !name.trim()) {
    const err = new Error("Name is required"); err.status = 400; throw err;
  }
  await userModel.updateName(userId, name.trim());
  const updated = await userModel.findById(userId);
  if (!updated) { const err = new Error("User not found"); err.status = 404; throw err; }
  return { id: updated.id, name: updated.name, email: updated.email, role: updated.role, is_active: updated.is_active, created_at: updated.created_at };
}

export async function changePassword({ userId, currentPassword, newPassword }) {
  if (!currentPassword || !newPassword) {
    const err = new Error("Both current and new password are required"); err.status = 400; throw err;
  }
  if (newPassword.length < 6) {
    const err = new Error("New password must be at least 6 characters"); err.status = 400; throw err;
  }
  const user = await userModel.findByIdWithPassword(userId);
  if (!user) { const err = new Error("User not found"); err.status = 404; throw err; }

  // Verify current password (supports dev placeholder hashes like HASH_TEACHER)
  let ok = false;
  const isPlaceholder = typeof user.password_hash === "string" && user.password_hash.startsWith("HASH_");
  if (process.env.NODE_ENV !== "production" && isPlaceholder) {
    const suffix = user.password_hash.slice(5);
    ok = currentPassword === user.password_hash || currentPassword === suffix ||
      (process.env.DEV_MASTER_PASSWORD && currentPassword === process.env.DEV_MASTER_PASSWORD);
  } else {
    ok = await comparePassword(currentPassword, user.password_hash);
  }

  if (!ok) {
    const err = new Error("Current password is incorrect"); err.status = 401; throw err;
  }

  const newHash = await hashPassword(newPassword);
  await userModel.updatePassword(userId, newHash);
}

export default { register, login, updateProfile, changePassword };
