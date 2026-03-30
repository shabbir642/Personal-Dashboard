# Personal Task Dashboard

A simple full-stack task management dashboard.

## Tech Stack
- Frontend: Next.js (App Router)
- Backend: FastAPI
- Database: SQLite (file-based local DB via SQLAlchemy)

## Project Structure

```
personal-task-dashboard/
  frontend/
  backend/
```

## Backend Setup

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload --port 8000
```

API base URL: `http://localhost:8000/api`

## Frontend Setup

```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

Frontend URL: `http://localhost:3000`

## Implemented Features

- Tables:
  - `tasks`
    - `id`, `title`, `description`, `status`, `priority`, `start_date`, `end_date`, `created_at`
  - `task_details`
    - `id`, `task_id`, `assigned_by`, `approach`, `key_learnings`, `notes`
  - `task_logs`
    - `id`, `task_id`, `issue`, `resolution`, `created_at`
  - `task_ai_insights`
    - `id`, `task_id`, `overview`, `suggestions`, `impact`, `skills_improvement`, `provider`, `model_name`, `created_at`
- REST APIs:
  - Tasks
    - `POST /api/tasks`
    - `GET /api/tasks`
    - `GET /api/tasks/{id}`
    - `PUT /api/tasks/{id}`
    - `DELETE /api/tasks/{id}`
  - Task AI Insight
    - `GET /api/tasks/{id}/ai-insight`
    - `POST /api/tasks/{id}/ai-insight/generate`
  - Task Details
    - `POST /api/tasks/{id}/details`
    - `GET /api/tasks/{id}/details`
    - `PUT /api/tasks/{id}/details`
  - Task Logs
    - `POST /api/tasks/{id}/logs`
    - `GET /api/tasks/{id}/logs`
  - Analytics
    - `GET /api/analytics/count-by-status`
    - `GET /api/analytics/count-by-priority`
    - `GET /api/analytics/completion-over-time`
- Frontend:
  - Create task form
  - Tasks table with sorting, filtering, search, and pagination
  - Status badges and priority color themes
  - Dark/light theme toggle
  - Clickable task rows that open an editable modal
  - Modal sections for basic info and deep details
  - Issue/resolution history with add-log form
  - Analytics page at `/analytics` with pie/bar/line charts
  - Loading and empty states

## Architecture Notes

- Backend:
  - Split routes: `tasks`, `task_details`, `task_logs`, `analytics`
  - Service layer added under `app/services`
  - Database config reads `DATABASE_URL` for easier SQLite -> PostgreSQL migration
- Frontend:
  - SWR used for local caching and data revalidation
  - API adapter layer maps backend payloads to UI models
  - Shared reusable components (header, theme provider, loading/empty states)

## Notes

- Data is stored locally in `backend/task_dashboard.db` by default.
- Override `DATABASE_URL` if you want a different SQLite file location.
- `Base.metadata.create_all(...)` currently manages table creation at app startup.
- AI task enrichment can be toggled by env:
  - `TASK_AI_ENRICHMENT_ENABLED` (default `true`)
  - `TASK_AI_PROVIDER` (`mock` or `openai`, default `mock`)
  - `TASK_AI_MODEL` (default `gpt-4.1-mini`)
  - `TASK_AI_OPENAI_API_KEY` (required only if `TASK_AI_PROVIDER=openai`)
