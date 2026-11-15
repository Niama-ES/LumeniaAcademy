<div align="center">

# 🦋 Luminia Academy

### Intelligent Learning Management Platform

<p>
  <em>A connected learning experience for students, teachers, and administrators.</em>
</p>

![React](https://img.shields.io/badge/Frontend-React_18-355B82?style=flat-square)
![Vite](https://img.shields.io/badge/Build-Vite-355B82?style=flat-square)
![JavaScript](https://img.shields.io/badge/Language-JavaScript-355B82?style=flat-square)
![JWT](https://img.shields.io/badge/Auth-JWT-355B82?style=flat-square)
![API](https://img.shields.io/badge/Communication-REST_API-355B82?style=flat-square)

</div>

---

## 🦋 Overview

**Luminia Academy** is a web-based learning platform designed to bring students, teachers, and administrators together in a centralized digital learning environment.

The frontend provides dedicated interfaces based on user roles, allowing students to access educational content, teachers to manage courses, and administrators to oversee platform activity.

Built with React and Vite, the application combines a responsive interface with a distinctive neural-inspired visual identity, featuring animated network visualizations and interactive dashboard elements.

## 🦋 Key Features

- **Role-Based Dashboards:** Dedicated interfaces for students, teachers, and administrators.
- **Student Learning Environment:** Access courses, explore chapters, and follow platform announcements.
- **Course Management:** Teachers can create, edit, and delete courses and their chapters.
- **Authentication:** Login, registration, and session management using JWT.
- **Administration:** User management, account activation/deactivation, and audit log access.
- **Interactive Visualizations:** Canvas-based neural networks, learning activity maps, and animated system grids.
- **API Integration:** Centralized API client connecting the frontend to the backend services.

## 🦋 Features by User Role

| Role | Capabilities |
|:---|:---|
| **Student** | Learning dashboard, course access, chapter reading, announcements |
| **Teacher** | Dashboard statistics, course and chapter management, announcements |
| **Admin** | User management, account activation/deactivation, audit logs |

## 🦋 Technology Stack

| Component | Technologies |
|:---|:---|
| Frontend Framework | React 18 |
| Build Tool | Vite |
| Styling | CSS3 |
| Authentication | JWT, localStorage |
| API Communication | REST API |
| Visualizations | HTML Canvas |
| Typography | Syne, DM Sans |

## 🦋 Design & Visual Identity

- **Color Palette:** Deep navy `#060D1A`, teal `#4ECDC4`, amber `#F7B731`, and violet `#A29BFE`.
- **Typography:** Syne for headings and DM Sans for body text.
- **Neural Animations:** Canvas-based network visualizations featuring pulsing nodes and traveling signal particles.
- **Glassmorphism:** Translucent interface cards with subtle glowing borders.
- **User Experience:** Consistent visual language across all role-based dashboards.

## 🦋 Project Structure

```text
src/
├── App.jsx
├── auth.jsx
├── api.js
├── styles.css
└── components/
    ├── Canvases.jsx
    ├── Landing.jsx
    ├── Auth.jsx
    ├── Sidebar.jsx
    ├── StudentDashboard.jsx
    ├── CoursesPage.jsx
    ├── ChapterView.jsx
    ├── AnnouncementsPage.jsx
    ├── TeacherDashboard.jsx
    ├── MyCourses.jsx
    ├── TeacherAnnouncements.jsx
    └── AdminPage.jsx
