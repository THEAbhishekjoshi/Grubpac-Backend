# Content Broadcasting System - Architecture Notes

## 1. Folder Structure
The project follows a standard MVC-like folder structure for clean code:
- `src/controllers/` -> Handles the request and response logic.
- `src/routes/`      -> Defines the API endpoints.
- `src/middlewares/` -> Checks for security and user roles.
- `src/config/`      -> Database connection setup.
- `src/utils/`       -> Helper functions (like Supabase S3 upload).

## 2. Database Design Decisions
- I used PostgreSQL with Prisma ORM because the data is highly relational.
- Users have Roles (`teacher` or `principal`).
- Content is linked to Users (who uploaded and who approved).
- `ContentSchedule` handles the position and duration of content in a loop.

## 3. Authentication & RBAC Flow
- I used JWT (JSON Web Tokens) for security.
- When a user logs in, they get a token containing their ID and Role.
- The system checks this token to know if the user is a Teacher or a Principal.

## 4. Middleware Usage
- `authMiddleware`: Verifies the JWT token. Blocks users without a valid token.
- `isTeacher`: Blocks anyone who is not a teacher.
- `isPrincipal`: Blocks anyone who is not a principal.

## 5. Upload Handling Approach
- I used `Multer` to accept files in Express.
- Files are not saved on the local server. They are sent directly to Supabase Storage (S3) as memory streams.
- The system checks that the file size is under 10MB and the format is only JPG, PNG, or GIF.

## 6. Approval Workflow Design
- Content uploaded by teachers is set to `pending` by default.
- Only the Principal can see pending content and approve or reject it.
- If rejected, the Principal must give a reason.

## 7. Subject-based System Design & Scheduling Logic (Continuous Loop)
- Content belongs to a specific subject (like Maths or Science).
- Each subject acts like a playlist.
- I used the Modulo operator (%) on the current time (in minutes) to find exactly which content should be playing right now.
- This creates an automatic, continuous loop without needing a cron job or background worker.

## 8. Scalability Approach (For the future)
- **Caching**: The `/content/live` API can be cached using Redis because students will hit this endpoint very often.
- **CDN**: Supabase storage URLs can be put behind a CDN like Cloudflare to serve images faster to students.
