
<div align="center">

# 🦋 Luminia Academy

### Intelligent Learning Management Platform

<p>
  <em>Where learning becomes visible, and knowledge connects.</em>
</p>

![Node.js](https://img.shields.io/badge/Backend-Node.js-355B82?style=flat-square)
![Express](https://img.shields.io/badge/API-Express.js-355B82?style=flat-square)
![SQLite](https://img.shields.io/badge/Database-SQLite-355B82?style=flat-square)
![React](https://img.shields.io/badge/Frontend-React-355B82?style=flat-square)
![Angular](https://img.shields.io/badge/Frontend-Angular-355B82?style=flat-square)
![Security](https://img.shields.io/badge/Security-RBAC-355B82?style=flat-square)

</div>

---

## 🦋 Overview

**Luminia Academy** is a modern educational web application designed to centralize the management of learning resources and academic communication through a secure, role-based environment.

Developed as part of the **Master ISI (Ingénierie des Systèmes Intelligents)**, the platform provides dedicated interfaces for students, teachers, and administrators, enabling course management, chapter organization, and announcement distribution.

The system follows a client-server architecture powered by a RESTful API and a relational SQLite database. Its backend is designed to remain independent of the presentation layer, demonstrated through two distinct frontend implementations built with React and Angular, both consuming the same backend services without modifying the business logic.

## 🦋 Key Features

- **Role-Based Access Control (RBAC):** Dedicated permissions and interfaces for students, teachers, and administrators.
- **Course Management:** Create, organize, update, and manage educational courses and their chapters.
- **Learning Environment:** Student access to available courses, learning materials, and announcements.
- **Announcement Management:** Centralized communication between platform users.
- **User Administration:** Manage user accounts and control account activation.
- **Authentication & Authorization:** Secure user authentication and role-based access to protected resources.
- **Audit Logs:** Track system activities and maintain a record of important user actions.
- **Frontend Independence:** Two separate frontend implementations consuming the same backend API.

## 🦋 User Roles & Capabilities

| Role | Main Responsibilities |
|:---|:---|
| **Student** | Access courses, read chapters, view announcements |
| **Teacher** | Create and manage courses, organize chapters, publish announcements |
| **Administrator** | Manage users, control account activation, monitor audit logs |

## 🦋 System Architecture

Luminia Academy follows a modular client-server architecture that separates presentation, business logic, and data persistence.

| Layer | Technologies | Responsibilities |
|:---|:---|:---|
| Frontend 1 | React | User interface and platform interaction |
| Frontend 2 | Angular | Alternative user interface implementation |
| Backend | Node.js, Express.js | REST API and business logic |
| Database | SQLite | Relational data persistence |
| Security | RBAC | Authentication, authorization, and access control |

### Architecture Highlights

- **Backend Independence:** Business logic is centralized in the API and shared by both frontend implementations.
- **RESTful Communication:** Frontends interact with backend services through HTTP requests.
- **Separation of Concerns:** Presentation, application logic, and data management remain independent.
- **Centralized Security:** Access permissions are enforced through role-based authorization.

  ## 🦋 Frontend Implementations

Luminia Academy explores frontend flexibility through two independent client implementations, both connected to the same backend API.

| Implementation | Technology | Repository |
|:---|:---|:---|
| Frontend 1 | React | Current repository |
| Frontend 2 | Angular | [View Angular Repository ↗](https://github.com/reem77-abd/Lumenia-Accademy) |

Both implementations consume the same REST API, demonstrating the separation between presentation and business logic.

## 🦋 Technology Stack

| Component | Technologies |
|:---|:---|
| Backend Runtime | Node.js |
| Backend Framework | Express.js |
| API Architecture | REST API |
| Database | SQLite |
| Frontend Frameworks | React, Angular |
| Authentication & Authorization | JWT / RBAC |
| Activity Monitoring | Audit Logs |

## 🦋 Visual Identity & Experience

Luminia Academy introduces a neural-inspired visual concept, representing learning as an interconnected network of knowledge.

- **Color Palette:** Deep navy and midnight blue backgrounds with glowing mint-teal accents.
- **Neural Visualization:** Interactive node graphs representing interconnected learning subjects.
- **Visual Elements:** Glowing network nodes, connecting signals, and animated canvas backgrounds.
- **Glassmorphism:** Translucent interface elements with subtle luminous borders.
- **Typography:** Syne and DM Sans.

The interface transforms abstract learning progress into a visual experience, connecting subjects such as English, Artificial Intelligence, Networking, Python, Databases, and Machine Learning.

## 🦋 Project Structure

```text
LuminiaAcademy/
│
├── backend/
├── frontend/
├── .gitignore
└── README.md
```

## 🦋 Project Information

| Detail | Description |
|:---|:---|
| Project | Luminia Academy |
| Domain | Educational Technology · Full-Stack Development |
| Academic Context | Master ISI |
| Architecture | Client-Server · REST API |
| Frontend Implementations | React & Angular |
| Backend | Node.js & Express |
| Database | SQLite |
| Access Management | Role-Based Access Control |

---

<div align="center">

### 🦋 Luminia Academy

*Where knowledge connects and learning comes to life.*

**Two interfaces. One backend. One connected learning experience.**

</div>
