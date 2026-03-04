// ─── Base request helper ───────────────────────────────────────────────────
const BASE = '/api';

function getToken() {
  return localStorage.getItem('lum_token');
}

function authHeaders() {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function req(method, path, body) {
  const opts = {
    method,
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
  };
  if (body !== undefined) opts.body = JSON.stringify(body);

  const res = await fetch(`${BASE}${path}`, opts);
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    // Backend error shape: { success: false, error: { message, code } }
    const msg = data?.error?.message || data?.message || `Error ${res.status}`;
    const err = new Error(msg);
    err.status = res.status;
    err.code = data?.error?.code;
    throw err;
  }
  return data;
}

const get   = (path)        => req('GET',    path);
const post  = (path, body)  => req('POST',   path, body);
const patch = (path, body)  => req('PATCH',  path, body);
const del   = (path)        => req('DELETE', path);

// ─── Auth ──────────────────────────────────────────────────────────────────
// POST /api/auth/login     → { success, data: { token, user } }
// POST /api/auth/register  → { success, data: { token, user } }
// GET  /api/auth/me        → { success, data: { user } }
export const authAPI = {
  login:          (email, password)              => post('/auth/login',    { email, password }),
  register:       (name, email, password, role)  => post('/auth/register', { name, email, password, role }),
  me:             ()                             => get('/auth/me'),
  logout:         ()                             => post('/auth/logout'),
  updateProfile:  (name)                         => patch('/auth/profile',  { name }),
  changePassword: (currentPassword, newPassword) => patch('/auth/password', { currentPassword, newPassword }),
};

// ─── Courses ───────────────────────────────────────────────────────────────
// GET /api/courses          → { success, data: { courses: [...] } }
// GET /api/courses?teacherId=X → same shape
export const coursesAPI = {
  list:          (q)   => get(`/courses${q ? `?q=${encodeURIComponent(q)}` : ''}`),
  listByTeacher: (tid) => get(`/courses?teacherId=${tid}`),
  get:           (id)  => get(`/courses/${id}`),
  create: (title, description) => post('/courses', { title, description }),
  update: (id, data)   => patch(`/courses/${id}`, data),
  delete: (id)         => del(`/courses/${id}`),
};

// ─── Chapters ──────────────────────────────────────────────────────────────
// GET /api/chapters/course/:courseId → { success, data: { chapters: [...] } }
// GET /api/chapters/:id              → { success, data: { chapter } }
export const chaptersAPI = {
  listByCourse: (courseId)       => get(`/chapters/course/${courseId}`),
  get:          (id)             => get(`/chapters/${id}`),
  create:       (courseId, data) => post(`/chapters/course/${courseId}`, data),
  update:       (id, data)       => patch(`/chapters/${id}`, data),
  delete:       (id)             => del(`/chapters/${id}`),
};

// ─── Announcements ─────────────────────────────────────────────────────────
// GET /api/announcements → { success, data: { announcements: [...] } }
export const announcementsAPI = {
  list:   ()         => get('/announcements'),
  get:    (id)       => get(`/announcements/${id}`),
  create: (data)     => post('/announcements', data),
  update: (id, data) => patch(`/announcements/${id}`, data),
  delete: (id)       => del(`/announcements/${id}`),
};

// ─── Consultations ─────────────────────────────────────────────────────────
export const consultationsAPI = {
  consultCourse:      (courseId)  => post(`/consultations/course/${courseId}`),
  consultChapter:     (chapterId) => post(`/consultations/chapter/${chapterId}`),
  myStudentProgress:  ()          => get('/consultations/student/me'),
  myConsultedChapters: (courseId) => get(`/consultations/student/me/chapters?courseId=${courseId}`),
  myTeacherConsults:  ()          => get('/consultations/teacher/me'),
};

// ─── Chapter Files ─────────────────────────────────────────────────────────
export const chapterFilesAPI = {
  list: (chapterId) => get(`/chapters/${chapterId}/files`),
  upload: (chapterId, file) => {
    const fd = new FormData();
    fd.append('file', file);
    return fetch(`/api/chapters/${chapterId}/files`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${getToken()}` },
      body: fd,
    }).then(async r => {
      const data = await r.json().catch(() => ({}));
      if (!r.ok) {
        const msg = data?.error?.message || data?.message || `Error ${r.status}`;
        const err = new Error(msg);
        err.status = r.status;
        throw err;
      }
      return data;
    });
  },
  delete: (chapterId, fileId) => del(`/chapters/${chapterId}/files/${fileId}`),
};

// ─── Teacher Stats ─────────────────────────────────────────────────────────
// GET /api/teacher-stats/me → { success, data: { stats } }
export const teacherStatsAPI = {
  me: () => get('/teacher-stats/me'),
};

// ─── Admin ─────────────────────────────────────────────────────────────────
// GET /api/admin/users → { success, data: [...] }  ← array directly in data
// GET /api/admin/logs  → { success, data: { logs: [...] } }
export const adminAPI = {
  listUsers:      ()          => get('/admin/users'),
  listLogs:       (limit=50)  => get(`/admin/logs?limit=${limit}`),
  activateUser:   (id)        => patch(`/admin/users/${id}/activate`),
  deactivateUser: (id)        => patch(`/admin/users/${id}/deactivate`),
};
