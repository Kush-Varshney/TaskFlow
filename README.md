# 📝 TaskFlow

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org/)
[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-18.2.0-61DAFB)](https://react.dev/)
[![MongoDB](https://img.shields.io/badge/MongoDB-7.x-47A248)](https://www.mongodb.com/)
[![Express](https://img.shields.io/badge/Express-4.18.2-000000)](https://expressjs.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.x-38B2AC)](https://tailwindcss.com/)

> A modern full-stack project and task management system with authentication, Kanban board, analytics dashboard, and clean architecture.

## 📋 Table of Contents

- **[🌟 Features](#-features)**
- **[🏗️ Architecture](#️-architecture)**
- **[📁 Project Structure](#-project-structure)**
- **[🚀 Quick Start](#-quick-start)**
- **[📚 API Documentation](#-api-documentation)**
- **[🚀 Deployment](#-deployment)**
- **[🔒 Security Features](#-security-features)**
- **[🧪 Testing](#-testing)**
- **[🐛 Troubleshooting](#-troubleshooting)**
- **[🤝 Contributing](#-contributing)**
- **[👤 Author](#-author)**
- **[📄 License](#-license)**

## 🌟 Features

### 🔐 Authentication & Security
- **JWT auth** with secure token storage
- **Protected API routes** via middleware
- **Password hashing** with bcrypt
- **Input validation** and CORS protection

### 📁 Projects & Tasks
- **Project CRUD** with pagination
- **Kanban board** with drag and drop (To Do, In Progress, Done)
- **Task CRUD** with priority and deadlines
- **Cascade delete** tasks when a project is removed
- **Filtering** by status, priority, date range

### 📈 Dashboard
- **Task status charts** (Pie/Bar)
- **Recent projects** and **overdue tasks**
- **Auto refresh** on changes

### 🎨 UI/UX
- **Responsive** Tailwind CSS design
- **Modern components** and clean layout
- **Friendly loading and error states**

## 🏗️ Architecture

- **Frontend**: Next.js App Router, TypeScript, Tailwind
- **Backend**: Express, Mongoose, JWT
- **Clean layers**: controllers → services → repositories → models

## 📁 Project Structure

```
TaskFlow/
├── backend/                       # Express API
│   └── src/
│       ├── app.js                 # App entry
│       ├── config/db.js           # Mongo connection
│       ├── controllers/           # Route handlers
│       ├── middlewares/           # Auth middleware
│       ├── models/                # Mongoose schemas
│       ├── repositories/          # DB access layer
│       ├── routes/                # Express routers
│       └── services/              # Business logic
│
├── frontend/                      # Next.js app
│   └── src/
│       ├── app/                   # App Router pages
│       ├── components/            # UI & features
│       ├── contexts/              # React contexts
│       └── lib/                   # API client/helpers
│
└── README.md                      # This file
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)

### 1) Clone and backend setup
```bash
git clone https://github.com/Kush-Varshney/TaskFlow.git
cd TaskFlow
cd backend
npm install
cp .env  # create and edit
npm run dev
```

Backend .env example:
```env
MONGODB_URI=mongodb://localhost:27017/taskflow
JWT_SECRET=your-secret
JWT_EXPIRES_IN=7d
PORT=5001
CORS_ORIGIN=http://localhost:3000
```

### 2) Frontend setup
```bash
cd frontend
npm install
cp .env  # create and edit
npm run dev
```

Frontend .env example:
```env
NEXT_PUBLIC_API_URL=http://localhost:5001/api
NEXT_PUBLIC_APP_NAME=TaskFlow
```

### URLs
- Frontend: http://localhost:3000
- Backend API: http://localhost:5001/api
- Health: http://localhost:5001/api/health

## 📚 API Documentation

### Auth
| Method | Endpoint | Body |
|---|---|---|
| POST | `/api/auth/signup` | `{ name, email, password }` |
| POST | `/api/auth/login` | `{ email, password }` |

### Projects
| Method | Endpoint | Notes |
|---|---|---|
| GET | `/api/projects` | `page`, `limit` query supported |
| POST | `/api/projects` | `{ name, description }` |
| GET | `/api/projects/:id` |  |
| PUT | `/api/projects/:id` |  |
| DELETE | `/api/projects/:id` | Cascade deletes tasks |

### Tasks
| Method | Endpoint | Notes |
|---|---|---|
| GET | `/api/tasks/project/:projectId` | Filters: `status`, `priority`, `deadlineStart`, `deadlineEnd` |
| POST | `/api/tasks` | `{ title, priority, deadline, projectId, status? }` |
| PUT | `/api/tasks/:id` | Partial update allowed |
| DELETE | `/api/tasks/:id` |  |

All non-auth routes require `Authorization: Bearer <token>` header.

## 🚀 Deployment

- Frontend: Vercel or any Node host
- Backend: Railway/Render/Heroku
- Set environment variables accordingly

## 🔒 Security Features

- JWT auth, password hashing, protected routes
- CORS configured for local dev
- No secrets committed; use env files

## 🧪 Testing

- Add your preferred testing setup (Jest/RTL) for unit/integration

## 🐛 Troubleshooting

- If frontend cannot reach backend, verify `NEXT_PUBLIC_API_URL` and backend port
- Ensure `token` exists in `localStorage` when calling protected routes
- Check backend logs for Mongo connection errors

## 🤝 Contributing

PRs welcome. Please follow conventional commits and keep PRs focused.

## 👤 Author

**Kush Varshney**  
B.Tech CSE | Full Stack Developer  
[Portfolio](https://kushvarshney.vercel.app/) • [GitHub](https://github.com/Kush-Varshney) • [LinkedIn](https://www.linkedin.com/in/kush-varshney-490baa250/)


## 📄 License

Licensed under the **MIT License**.