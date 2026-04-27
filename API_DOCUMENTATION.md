# API Documentation - Content Broadcasting System

This document provides detailed information about the API endpoints, request payloads, and response formats.

## Base URL
`http://localhost:3000`

---

## 🔐 Authentication

### 1. Register User
`POST /auth/register`

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword",
  "role": "teacher" 
}
```
*Note: Role must be either `teacher` or `principal`.*

**Response (201 Created):**
```json
{
  "message": "User registered successfully",
  "userId": "uuid-string"
}
```

### 2. Login
`POST /auth/login`

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "securepassword"
}
```

**Response (200 OK):**
```json
{
  "message": "Login successful",
  "token": "eyJhbG...",
  "user": {
    "id": "uuid-string",
    "name": "John Doe",
    "role": "teacher"
  }
}
```

---

## 🏫 Teacher Endpoints (`/content/teacher`)
*All endpoints require Bearer Token in the `Authorization` header.*

### 1. Upload Content
`POST /content/teacher/`

**Request Headers:**
`Content-Type: multipart/form-data`

**Request Body (form-data):**
- `file`: (Required) Image/GIF file (Max 10MB)
- `title`: (Required) Content Title
- `description`: (Optional) Content Description
- `subject`: (Required) Subject name (e.g., "Mathematics")
- `duration`: (Optional) Duration in minutes for the rotation (Default: 5)
- `startTime`: (Optional) ISO Date string
- `endTime`: (Optional) ISO Date string

**Response (201 Created):**
```json
{
  "message": "Content uploaded and pending approval",
  "content": { ... }
}
```

### 2. Get My Content
`GET /content/teacher/my`

**Response (200 OK):**
```json
[
  {
    "id": "uuid",
    "title": "Algebra Lesson 1",
    "status": "pending",
    "fileUrl": "...",
    ...
  }
]
```

---

## 🎓 Principal Endpoints (`/content`)
*All endpoints require Bearer Token in the `Authorization` header and Principal role.*

### 1. Get All Content
`GET /content/`

Returns a list of all content in the system.

### 2. Get Pending Content
`GET /content/pending`

Returns content awaiting approval.

### 3. Approve Content
`POST /content/:id/approve`

**Response (200 OK):**
```json
{
  "message": "Content approved successfully",
  "content": { ... }
}
```

### 4. Reject Content
`POST /content/:id/reject`

**Request Body:**
```json
{
  "reason": "Image quality is too low."
}
```

---

## 📺 Broadcasting Endpoints (`/content/live`)

### 1. Get Live Content
`GET /content/live/:teacherId`

Fetches the currently active content for a specific teacher based on the rotation schedule.

**Response (200 OK):**
```json
{
  "teacherId": "uuid",
  "currentTime": "2024-04-28T...",
  "liveContent": {
    "Mathematics": {
      "id": "uuid",
      "title": "Algebra Basics",
      "fileUrl": "...",
      "subject": "Mathematics",
      "endsInMinutes": 3
    }
  }
}
```

---

## Error Codes
- `400 Bad Request`: Missing fields or validation error.
- `401 Unauthorized`: Missing or invalid JWT token.
- `403 Forbidden`: Insufficient permissions (e.g., Teacher trying to access Principal routes).
- `404 Not Found`: Resource does not exist.
- `429 Too Many Requests`: Rate limit exceeded.
- `500 Internal Server Error`: Server-side error.
