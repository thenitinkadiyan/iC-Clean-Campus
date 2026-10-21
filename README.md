# 🌱 iC Clean Campus — Smart Clean Sustainable

A full-stack campus cleanliness and waste management web platform designed to streamline garbage reporting, recycling requests, cleaning task assignments, and administrative oversight.

---

## ✨ Features

- **Role-Based Access Control**:
  - 🎓 **Student / User**: Report garbage issues, submit recycling requests, view complaint status and history, manage profile.
  - 🧹 **Staff / Cleaning Crew**: View assigned cleaning tasks, update task statuses (Pending, In Progress, Completed), view campus issue notices.
  - 🛡️ **Admin**: Manage reported issues, assign tasks to staff, track recycling requests, review platform analytics.
  - 👑 **Main Admin**: Full administrative control, user role management, system settings, database management.
- **Modern User Experience**:
  - Responsive, clean interface built with React, Vite, and modern CSS design tokens.
  - Live toast feedback, status filters, interactive modals, and real-time state updates.
- **Robust Backend & Persistence**:
  - RESTful API built on Node.js and Express.
  - JWT authentication and bcrypt password hashing.
  - PostgreSQL / Supabase support with automatic failover to persistent local JSON store if a database is not configured.

---

## 🏗️ Project Architecture

```
iC-Clean-Campus/
├── backend/                  # Node.js + Express REST API
│   ├── auth.js               # JWT authentication & role middleware
│   ├── db.js                 # PostgreSQL / Supabase / fallback storage layer
│   ├── schema.sql            # PostgreSQL schema definition
│   ├── server.js             # API route endpoints & controllers
│   ├── package.json
│   └── .env.example
├── frontend/                 # React + Vite Client Application
│   ├── src/
│   │   ├── components/       # Reusable UI components (Navbar, Modal, Toast)
│   │   ├── context/          # React AuthContext for state & tokens
│   │   ├── pages/            # Page views (Dashboards, Auth, Reports)
│   │   ├── services/         # Axios API service client
│   │   ├── App.jsx           # Main routing & layout
│   │   └── index.css         # Global styles & design system
│   ├── package.json
│   └── vite.config.js
├── backend_python_legacy/    # Archived legacy Python backend
└── frontend_legacy/          # Archived legacy static HTML/JS frontend
```

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [PostgreSQL](https://www.postgresql.org/) (Optional, local storage fallback is provided)

---

### 1. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` directory (you can copy `.env.example`):

```bash
cp .env.example .env
```

Start the backend server:

```bash
npm run dev
# Or for standard node run:
npm start
```

The backend server runs on `http://localhost:8001`.

---

### 2. Frontend Setup

In a new terminal window:

```bash
cd frontend
npm install
npm run dev
```

The frontend development server will launch at `http://localhost:5173`.

---

## 🔑 Default Credentials

- **Main Admin**:
  - ID / Username: `2707`
  - Password: `Nitin@2007`
- New students and staff can register through the **Sign Up** page.

---

## 📦 Build for Production

To create an optimized production build of the frontend:

```bash
cd frontend
npm run build
```

---

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).
