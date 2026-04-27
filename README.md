# Content Broadcasting System - Backend

A robust backend system for managing educational content, featuring roles for Teachers (content creators) and Principals (approvers), with a dynamic broadcasting schedule.

[**View Architecture Notes**](file:///c:/Users/Mr.%20Abhishek/OneDrive/Documents/Grubpac-Backend-Assignment/ARCHITECTURE_NOTES.md) | [**API Documentation**](file:///c:/Users/Mr.%20Abhishek/OneDrive/Documents/Grubpac-Backend-Assignment/API_DOCUMENTATION.md)

## 🚀 Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js (v5.0)
- **Language:** TypeScript
- **Database:** PostgreSQL (via Supabase)
- **ORM:** Prisma
- **Storage:** Supabase Storage (for media assets)
- **Security:** CORS enabled & Rate Limiting (express-rate-limit)
- **Authentication:** JWT (JSON Web Tokens) & Bcryptjs
- **File Handling:** Multer

## 🛠️ Setup Instructions

### 1. Clone & Install
```bash
git clone <repository-url>
cd grubpac-backend-assignment
npm install
```

### 2. Environment Configuration
Create a `.env` file in the root directory and add the following variables:
```env
DATABASE_URL="your_postgresql_connection_string"
JWT_SECRET_CODE="your_jwt_secret"
SUPABASE_PROJECT_ID="your_project_id"
SUPABASE_ACCESS_KEY="your_access_key"
SUPABASE_SECRET_KEY="your_secret_key"
PORT=3000
```

### 3. Database Initialization
```bash
# Generate Prisma Client
npx prisma generate

# Sync Database Schema
npx prisma db push
```

### 4. Running the Application
```bash
# Development mode
npm run dev

# Production Build & Run
tsc
node dist/index.js
```

---

## 📡 API Documentation

### Authentication
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| POST | `/auth/register` | Register a new user (Role: `teacher` or `principal`) | No |
| POST | `/auth/login` | Login and receive JWT token | No |

### Teacher Routes (`/content/teacher`)
*Requires `teacher` role and Authorization header.*

| Method | Endpoint | Description | Payload |
| :--- | :--- | :--- | :--- |
| POST | `/` | Upload new content | `multipart/form-data` (file, title, subject, etc.) |
| GET | `/my` | Get all content uploaded by current teacher | None |
| GET | `/:id` | Get specific content details | None |

### Principal Routes (`/content`)
*Requires `principal` role and Authorization header.*

| Method | Endpoint | Description | Payload |
| :--- | :--- | :--- | :--- |
| GET | `/` | View all content across the system | None |
| GET | `/pending` | View all content awaiting approval | None |
| POST | `/:id/approve` | Approve a content piece | None |
| POST | `/:id/reject` | Reject a content piece | `{ "reason": "string" }` |

### Broadcasting Routes (`/content/live`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| GET | `/:teacherId` | Get currently "live" content for a specific teacher | No |

---

## 🔄 Broadcasting Logic
The system implements a rotation-based broadcasting schedule:
1. Content is grouped by **Subject**.
2. Within each subject, approved content rotates based on a **Rotation Order**.
3. Each content piece has a **Duration** (in minutes).
4. The system calculates the current active content by taking the total cycle duration and finding the offset from the current time.

## 📂 Project Structure
- `src/controllers`: Request handlers and business logic.
- `src/routes`: API endpoint definitions.
- `src/middlewares`: Authentication and role-based access control.
- `src/utils`: Helper functions (Supabase storage, etc.).
- `src/generated`: Prisma generated client.
- `prisma/`: Database schema and migrations.

---

## 🔒 Security
- **CORS**: Enabled for all origins to prevent cross-origin issues.
- **Rate Limiting**: 
    - **Auth**: 20 requests per hour (Login/Register).
    - **Live Content**: 100 requests per 15 minutes.
- Password hashing using **Bcryptjs**.
- Role-Based Access Control (RBAC) via `authMiddleware`, `isTeacher`, and `isPrincipal`.
- Secure file uploads with file type (JPG, PNG, GIF) and size (10MB) validation.
