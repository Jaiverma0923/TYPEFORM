# Typeform Clone Backend

FastAPI + SQLAlchemy async backend for creating forms, questions, public submissions, response reporting, and analytics.

## Stack and architecture

FastAPI, Pydantic v2, SQLAlchemy 2 async, SQLite/aiosqlite, Alembic, pytest. Routes delegate to services; models live in `app/models`, schemas in `app/schemas`, and database infrastructure in `app/db`.

## Setup

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
Copy-Item .env.example .env
alembic upgrade head
python -m app.db.seed
uvicorn app.main:app --reload
pytest
```

Swagger: `http://localhost:8000/docs`; API prefix: `/api/v1`; contract: [docs/api-contract.md](docs/api-contract.md).

## Environment

`DATABASE_URL=sqlite+aiosqlite:///./typeform.db`, `FRONTEND_BASE_URL=http://localhost:3000`, `BACKEND_BASE_URL=http://localhost:8000`, `APP_ENV=development`, plus the fields in `.env.example`. CORS allows `FRONTEND_URL`.

## Database and API

Tables: creators, forms, form_themes, logic_rules, questions, form_responses, answers. Alembic migration: `alembic upgrade head`. The seed command creates default creator `1`, Customer Feedback (published, slug `customer-feedback-demo`) and Event Registration (draft), all question types, and analytics-ready responses.

The backend assumes one creator and has no authentication. SQLite is appropriate for local development; use a production database and managed migrations for deployment. No frontend field transforms are required: JSON is snake_case and exposes `settings`, never `settings_json`.

## Frontend handoff

- Backend base URL: `http://localhost:8000`
- API prefix: `/api/v1`
- Swagger: `/docs`
- Seeded forms: Customer Feedback and Event Registration; public slug: `customer-feedback-demo`
- Enums: `draft`, `published`; `short_text`, `long_text`, `multiple_choice`, `dropdown`, `email`, `number`, `yes_no`, `rating`
- Next.js environment: `NEXT_PUBLIC_API_BASE_URL=http://localhost:8000`
- No test credentials; authentication is not implemented.
