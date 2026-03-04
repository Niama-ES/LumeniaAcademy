# Luminia Academy — Frontend

Neural-aesthetic React frontend connecting to the Luminia Academy backend.

## Stack
- **React 18** (Vite)
- **No extra UI libraries** — pure CSS with neural network canvas animations
- **JWT auth** via localStorage
- **API proxy** to backend via Vite dev server

## Project Structure

```
luminia-frontend/
├── src/
│   ├── main.jsx              # React entry point
│   ├── App.jsx               # Root routing / auth gates
│   ├── auth.jsx              # Auth context (login, register, logout)
│   ├── api.js                # Full API client (auth, courses, chapters, announcements, admin...)
│   ├── styles.css            # Full design system CSS
│   └── components/
│       ├── Canvases.jsx      # All neural canvas animations (NeuralBg, LearningCore, SystemGrid...)
│       ├── Landing.jsx       # Landing page (hero, features, roles, CTA)
│       ├── Auth.jsx          # Login + Register pages
│       ├── Sidebar.jsx       # Role-based sidebar navigation
│       ├── StudentDashboard.jsx
│       ├── CoursesPage.jsx   # Course list + chapter drill-down
│       ├── ChapterView.jsx   # Chapter reading view
│       ├── AnnouncementsPage.jsx
│       ├── TeacherDashboard.jsx
│       ├── MyCourses.jsx     # Teacher: create/manage courses & chapters
│       ├── TeacherAnnouncements.jsx
│       └── AdminPage.jsx     # Admin: user management + audit logs
├── index.html
├── vite.config.js            # Proxies /api → http://localhost:3001
└── package.json
```

## Setup & Run

### 1. Install dependencies
```bash
npm install
```

### 2. Start the backend first
Make sure the Luminia backend is running on port **3001** (default).

### 3. Start the frontend dev server
```bash
npm run dev
```

Frontend runs on **http://localhost:3000**. All `/api` calls are automatically proxied to `http://localhost:3001`.

### 4. Build for production
```bash
npm run build
# Outputs to dist/
```
Deploy the `dist/` folder. Configure your server/nginx to proxy `/api` → backend.

## Backend Port

If your backend runs on a different port, edit `vite.config.js`:

```js
proxy: {
  '/api': {
    target: 'http://localhost:3001', // ← change this
    changeOrigin: true,
  }
}
```

## Features by Role

| Role | Pages |
|------|-------|
| **STUDENT** | Dashboard (Learning Core canvas), Courses + Chapters, Announcements |
| **TEACHER** | Stats + Neural Activity Map, My Courses (create/edit/delete), Announcements |
| **ADMIN** | System Grid (all users canvas), User management (activate/deactivate), Audit logs |

## Design System

- **Colors:** Navy `#060D1A`, Teal `#4ECDC4`, Amber `#F7B731`, Violet `#A29BFE`
- **Fonts:** Syne (headings), DM Sans (body) — loaded from Google Fonts
- **Animations:** Canvas-based neural network with pulsing nodes, traveling signal beads
- **Glass cards:** `rgba(10,22,40,0.72)` background with teal-glow borders
