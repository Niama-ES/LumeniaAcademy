PRAGMA foreign_keys = ON;

-- =========================
-- USERS
-- =========================
CREATE TABLE IF NOT EXISTS users (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  name          TEXT NOT NULL,
  email         TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role          TEXT NOT NULL CHECK (role IN ('STUDENT', 'TEACHER', 'ADMIN')),
  is_active     INTEGER NOT NULL DEFAULT 1 CHECK (is_active IN (0, 1)),
  created_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

-- =========================
-- COURSES (owned by teacher)
-- =========================
CREATE TABLE IF NOT EXISTS courses (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  title       TEXT NOT NULL,
  description TEXT,
  teacher_id  INTEGER NOT NULL,
  created_at  TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE CASCADE
);

-- =========================
-- CHAPTERS (inside course)
-- =========================
CREATE TABLE IF NOT EXISTS chapters (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  course_id   INTEGER NOT NULL,
  title       TEXT NOT NULL,
  content     TEXT NOT NULL,
  order_index INTEGER NOT NULL DEFAULT 1,
  created_at  TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
  UNIQUE(course_id, order_index)
);

-- =========================
-- ANNOUNCEMENTS (teacher posts)
-- =========================
CREATE TABLE IF NOT EXISTS announcements (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  teacher_id INTEGER NOT NULL,
  title      TEXT NOT NULL,
  content    TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_announcements_time
  ON announcements(created_at);

CREATE INDEX IF NOT EXISTS idx_announcements_teacher
  ON announcements(teacher_id);

-- =========================
-- CONSULTATIONS (required stats)
-- Student views course/chapter
-- chapter_id can be NULL for course-level consult
-- =========================
CREATE TABLE IF NOT EXISTS consultations (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  student_id  INTEGER NOT NULL,
  course_id   INTEGER NOT NULL,
  chapter_id  INTEGER,
  consulted_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (course_id)  REFERENCES courses(id) ON DELETE CASCADE,
  FOREIGN KEY (chapter_id) REFERENCES chapters(id) ON DELETE SET NULL
);

-- =========================
-- AUDIT LOGS (ADMIN)
-- Logs ONLY:
-- - login success / failure
-- - DELETE actions
-- =========================
CREATE TABLE IF NOT EXISTS audit_logs (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,

  -- Who performed the action (NULL for unknown user in failed login)
  user_id     INTEGER,

  -- What happened
  -- Examples:
  -- LOGIN_SUCCESS
  -- LOGIN_FAILED
  -- DELETE_ACTION
  action      TEXT NOT NULL,

  -- What was deleted (ONLY for DELETE_ACTION)
  -- Examples: 'COURSE', 'CHAPTER', 'ANNOUNCEMENT', 'USER'
  entity_type TEXT,

  -- ID of deleted entity (ONLY for DELETE_ACTION)
  entity_id   INTEGER,

  -- Extra info (JSON as TEXT)
  -- Used mainly for login logs (email, reason, ip)
  meta_json   TEXT,

  created_at  TEXT NOT NULL DEFAULT (datetime('now')),

  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);


-- =========================
-- CHAPTER FILES (attachments)
-- =========================
CREATE TABLE IF NOT EXISTS chapter_files (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  chapter_id    INTEGER NOT NULL,
  original_name TEXT NOT NULL,
  stored_name   TEXT NOT NULL,
  mimetype      TEXT NOT NULL,
  size          INTEGER NOT NULL,
  created_at    TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (chapter_id) REFERENCES chapters(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_chapter_files_chapter
  ON chapter_files(chapter_id);

-- =========================
-- INDEXES (speed for stats + admin)
-- =========================
CREATE INDEX IF NOT EXISTS idx_courses_teacher
  ON courses(teacher_id);

CREATE INDEX IF NOT EXISTS idx_chapters_course
  ON chapters(course_id);

-- Announcements indexes are already defined above:
-- idx_announcements_time, idx_announcements_teacher

CREATE INDEX IF NOT EXISTS idx_consultations_course_time
  ON consultations(course_id, consulted_at);

CREATE INDEX IF NOT EXISTS idx_consultations_chapter_time
  ON consultations(chapter_id, consulted_at);

CREATE INDEX IF NOT EXISTS idx_audit_logs_time
  ON audit_logs(created_at);

CREATE INDEX IF NOT EXISTS idx_audit_logs_user_time
  ON audit_logs(user_id, created_at);
