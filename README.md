# Personal Task Dashboard

A simple full-stack task management dashboard.

## Tech Stack
- Frontend: Next.js (App Router)
- Backend: FastAPI
- Database: SQLite (in-memory via SQLAlchemy)

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
- REST APIs:
  - Tasks
    - `POST /api/tasks`
    - `GET /api/tasks`
    - `GET /api/tasks/{id}`
    - `PUT /api/tasks/{id}`
    - `DELETE /api/tasks/{id}`
  - Task Details
    - `POST /api/tasks/{id}/details`
    - `GET /api/tasks/{id}/details`
    - `PUT /api/tasks/{id}/details`
  - Task Logs
    - `POST /api/tasks/{id}/logs`
    - `GET /api/tasks/{id}/logs`
- Frontend:
  - Create task form
  - Tasks table with sorting and filtering
  - Status badges and priority color themes
  - Clickable task rows that open an editable modal
  - Modal sections for basic info and deep details
  - Issue/resolution history with add-log form

## Notes

- The database is in-memory for now. Data resets when backend restarts.
- Architecture is modular so persistence can be switched later with minimal changes.
