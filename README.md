# Assignly — Backend

> Node.js + Express.js REST API for the Assignly Assignment Management Platform.  
> Built as a full-stack MERN portfolio project following SDLC methodology.

**Frontend Repo:** [github.com/Abhijeet-109/assignly-frontend](https://github.com/Abhijeet-109/assignly-frontend)

---

## Overview

Assignly's backend is a RESTful API serving three user roles — Admin, Teacher, and Student — with full JWT authentication, role-based access control, file upload handling, CSV export, and real-time notification support via polling. 40+ endpoints across 12 route modules.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js |
| Framework | Express.js |
| Database | MongoDB Atlas (Mongoose ODM) |
| Authentication | JWT (24hr expiry) + tokenVersion invalidation |
| File Uploads | Multer (disk storage) |
| CSV Export | Custom `csvExporter.js` utility |
| Deployment | Render (free tier) |

---

## Features

- **JWT Auth** with `tokenVersion` field — invalidates all tokens on logout; prevents stale token reuse
- **RBAC** — three roles: `admin`, `teacher`, `student`; `isSuperAdmin` flag for elevated admin actions
- **Assignment Lifecycle** — create → assign to students (junction model) → submit → grade/rework → resubmit
- **Grading embedded in Submission** — no separate marks collection; grade data lives on the `Submission` document
- **Real-Time Notifications** — created server-side on key events (assignment, grading, rework); consumed by 30s frontend polling
- **Self-Upload Portal** — students upload private resources independent of teacher-assigned work
- **CSV Export** — teachers and admins can export submission data per assignment
- **Role-Based Dashboards** — `/dashboard/admin`, `/dashboard/teacher`, `/dashboard/student` return tailored summary stats
- **Avatar Uploads** — Multer stores profile pictures under `uploads/avatars/`
- **CORS Configured** — whitelisted origins for Vercel frontend

---

## Project Structure

```
backend/
├── src/
│   ├── config/
│   │   ├── database.js         # MongoDB Atlas connection
│   │   ├── environment.js      # env var loader + validation
│   │   ├── constants.js        # App-wide constants
│   │   └── multer.js           # File upload config (size limits, filters)
│   ├── controllers/
│   │   ├── authController.js           # register, login, logout, /me
│   │   ├── userController.js           # CRUD users (Admin)
│   │   ├── assignmentController.js     # create, update, delete, list
│   │   ├── studentAssignmentController.js  # assign/unassign junction
│   │   ├── submissionController.js     # submit, resubmit, list
│   │   ├── studentController.js        # student profile + progress
│   │   ├── teacherController.js        # teacher profile + stats
│   │   ├── subjectController.js        # subject CRUD
│   │   ├── notificationController.js   # list, mark read, clear
│   │   ├── selfUploadController.js     # student private uploads
│   │   ├── exportController.js         # CSV generation
│   │   └── dashboardController.js      # role-based summary stats
│   ├── middleware/
│   │   ├── authMiddleware.js       # verifyToken, isSuperAdmin
│   │   ├── roleMiddleware.js       # requireRole(), requireSuperAdmin()
│   │   ├── corsMiddleware.js       # CORS whitelist
│   │   ├── errorMiddleware.js      # global error handler
│   │   └── validationMiddleware.js # request body validation
│   ├── models/
│   │   ├── User.js                 # base user (role, tokenVersion, theme)
│   │   ├── Teacher.js              # Teacher profile (ref: User)
│   │   ├── Student.js              # Student profile (ref: User)
│   │   ├── Subject.js              # Subject (name, code, teacher)
│   │   ├── Assignment.js           # Assignment (subject, teacher, deadline)
│   │   ├── StudentAssignment.js    # Junction: Assignment ↔ Student
│   │   ├── Submission.js           # Submission + embedded grade
│   │   ├── Notification.js         # userId, message, type, read
│   │   └── SelfUpload.js           # Student private tracker
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── userRoutes.js
│   │   ├── assignmentRoutes.js
│   │   ├── studentAssignmentRoutes.js
│   │   ├── submissionRoutes.js
│   │   ├── studentRoutes.js
│   │   ├── teacherRoutes.js
│   │   ├── subjectRoutes.js
│   │   ├── notificationRoutes.js
│   │   ├── selfUploadRoutes.js
│   │   ├── exportRoutes.js
│   │   └── dashboardRoutes.js
│   ├── utils/
│   │   ├── tokenUtils.js       # signToken, verifyToken helpers
│   │   ├── passwordUtils.js    # bcrypt hash + compare
│   │   ├── csvExporter.js      # CSV string builder
│   │   └── logger.js           # Console logger utility
│   ├── validators/
│   │   ├── authValidator.js
│   │   ├── assignmentValidator.js
│   │   └── submissionValidator.js
│   └── server.js               # Express app setup + route mounting
├── uploads/                    # Multer file storage (gitignored)
│   └── avatars/
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

---

## Database Schema (MongoDB Collections)

| Collection | Purpose |
|---|---|
| `users` | Auth credentials, role, tokenVersion, theme preference |
| `teachers` | Teacher profile linked to User |
| `students` | Student profile linked to User |
| `subjects` | Subject with teacher reference |
| `assignments` | Assignment with subject + deadline |
| `student_assignments` | Junction — which student has which assignment |
| `submissions` | File submission + embedded grade/feedback |
| `notifications` | Event-driven messages per user |
| `selfuploads` | Student private upload tracker |

> Grading is **embedded inside Submission** (not a separate collection) — accessed together in one query, simplifies CSV export.

---

## API Endpoints Summary

### Auth — `/api/auth`
| Method | Route | Access |
|---|---|---|
| POST | `/register` | Public |
| POST | `/login` | Public |
| POST | `/logout` | Auth |
| GET | `/me` | Auth |
| POST | `/create-admin` | SuperAdmin |

### Assignments — `/api/assignments`
| Method | Route | Access |
|---|---|---|
| GET | `/` | Auth |
| POST | `/` | Teacher |
| PUT | `/:id` | Teacher |
| DELETE | `/:id` | Teacher/Admin |
| GET | `/:id` | Auth |

### Submissions — `/api/submissions`
| Method | Route | Access |
|---|---|---|
| POST | `/` | Student |
| GET | `/assignment/:assignmentId` | Teacher/Admin |
| GET | `/my` | Student |
| PUT | `/:id/grade` | Teacher |
| PUT | `/:id/resubmit` | Student |

### Dashboard — `/api/dashboard`
| Method | Route | Access |
|---|---|---|
| GET | `/admin` | Admin |
| GET | `/teacher` | Teacher |
| GET | `/student` | Student |

*(Full route list across all 12 modules — 40+ endpoints total)*

---

## Getting Started

### Prerequisites
- Node.js v18+
- MongoDB Atlas cluster (or local MongoDB)

### Installation

```bash
git clone https://github.com/Abhijeet-109/assignment-manager-backend.git
cd assignment-manager-backend
npm install
```
### Run Dev Server

```bash
npm run dev
```

API runs at `http://localhost:5000`

---

## Key Design Decisions

| Decision | Reason |
|---|---|
| `tokenVersion` on User model | Invalidates all existing JWTs on logout — prevents stale token attacks |
| Grading embedded in Submission | One-to-one relationship; always queried together; simplifies CSV export |
| `StudentAssignment` junction model | Single source of truth for student-assignment relationships; enables targeted assignment |
| Route ordering (specific before parameterised) | `/notifications/read-all` registered before `/:id` to prevent interception |
| `requireSuperAdmin()` middleware | Separate from `requireRole('admin')` — only one account can create other admins |
| ObjectId comparisons via `.toString()` | Avoids ObjectId vs String mismatch bugs in `.find()` queries |

---

## Deployment

Deployed on **Render** (free tier, auto-deploy from GitHub).

Set all `.env` variables in Render's environment settings.

**Note:** Free tier Render instances spin down after inactivity — first request may take ~30s.

---

## Author

**Abhijeet**  
MCA Student · Full Stack Developer  
[GitHub](https://github.com/Abhijeet-109)
