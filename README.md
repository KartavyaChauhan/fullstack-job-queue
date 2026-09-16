# Mini Job Queue Dashboard

This is a full-stack job queue management dashboard built with **React (Vite)** and **NestJS**. It is designed to demonstrate API design, state management, validation, and robust handling of real-world concurrency edge cases.

## System Architecture

- **Frontend**: React, Vite, TypeScript, Axios. Uses simple vanilla CSS with modern UI principles (glassmorphism, CSS variables).
- **Backend**: NestJS, TypeScript.
- **Database**: SQLite (managed via Prisma ORM) for zero-configuration local persistence.

## Important Engineering Decisions

1. **Handling Concurrency (The "Two Tabs" Problem)**: 
   To prevent two users from concurrently transitioning a job from `pending` to `running`, the system uses **Database-level Optimistic Concurrency Control**.
   - Rather than fetching the job, checking the status in Node.js, and saving it (which creates a race condition), the `JobsService` executes an atomic database update.
   - The query explicitly demands that the job is in the required previous state: `updateMany({ where: { id, status: 'pending' }, data: { status: 'running' } })`.
   - If the update affects `0` rows, the API safely assumes the state was already changed by another request and returns a `409 Conflict` error. The frontend catches this, displays a friendly error banner, and automatically refreshes the jobs list to sync the UI.

2. **State Machine Enforcement**:
   - The API strictly enforces the transition graph: `pending -> running -> completed | failed`.
   - A `ValidationPipe` ensures the payload contains only allowed statuses.

3. **Separation of Concerns**:
   - The React frontend encapsulates API calls into a dedicated `api.ts` service rather than polluting components.
   - The NestJS backend isolates database access into `PrismaService` and business logic into `JobsService`.

## Bonus: Production-Ready Improvement

**Improvement Added**: CORS Hardening & Global Validation Pipeline.
While the current implementation uses a wide-open `app.enableCors()`, in a true production system, I would lock this down to specific frontend origins. 
However, for the specific code improvement implemented: **Global DTO Validation (`ValidationPipe`) with Whitelisting**.
- **Why I chose it**: Without `whitelist: true`, malicious users could inject arbitrary fields into the `POST /jobs` payload (e.g., overriding the `id` or injecting an unexpected `status` during creation). By enabling the global validation pipe with whitelisting, the NestJS application automatically strips out any fields that do not explicitly exist in the DTO, protecting the database from Prototype Pollution or Mass Assignment vulnerabilities.

*(Another potential improvement would be adding Pagination to the `GET /jobs` endpoint so the dashboard doesn't crash when loading millions of historical jobs).*

## Setup Instructions

### 1. Backend Setup

Open a terminal and navigate to the backend directory:
```bash
cd backend
npm install
npm run start:dev
```
*Note: SQLite is already initialized. The backend will run on `http://localhost:3000`.*

### 2. Frontend Setup

Open a second terminal and navigate to the frontend directory:
```bash
cd frontend
npm install
npm run dev
```
*The frontend will run on `http://localhost:5173`.*
