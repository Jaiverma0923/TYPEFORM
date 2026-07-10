import asyncio
from datetime import datetime, timezone

from fastapi.testclient import TestClient
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine

from app.db.base import Base
from app.db.database import get_db
from app.main import app
from app.models import Answer, Creator, Form, FormResponse, Question, QuestionType


def test_response_reporting_and_analytics(tmp_path) -> None:
    engine = create_async_engine(f"sqlite+aiosqlite:///{tmp_path / 'reporting.db'}"); asyncio.run(_seed(engine))
    sessions = async_sessionmaker(engine, expire_on_commit=False)
    async def override_db():
        async with sessions() as session: yield session
    app.dependency_overrides[get_db] = override_db; client = TestClient(app)
    try:
        listing = client.get("/api/v1/forms/1/responses", params={"limit": 1})
        assert listing.status_code == 200 and listing.json()["data"]["pagination"]["total"] == 2
        preview = listing.json()["data"]["items"][0]["preview"]
        assert [item["question_id"] for item in preview] == [1, 2, 3]
        detail = client.get("/api/v1/responses/1"); assert detail.status_code == 200 and [a["question_id"] for a in detail.json()["data"]["answers"]] == [1, 2, 3]
        assert client.get("/api/v1/responses/999").status_code == 404
        analytics = client.get("/api/v1/forms/1/analytics").json()["data"]
        assert analytics["total_responses"] == 2 and analytics["average_completion_time_seconds"] == 15
        choice, rating, yes_no = analytics["questions"]
        assert choice["summary"]["counts"] == [{"label": "A", "count": 1, "percentage": 100.0}, {"label": "B", "count": 0, "percentage": 0.0}]
        assert rating["summary"]["distribution"] == [{"value": 1, "count": 0}, {"value": 2, "count": 0}, {"value": 3, "count": 1}, {"value": 4, "count": 0}, {"value": 5, "count": 0}]
        assert yes_no["summary"] == {"yes": 1, "no": 0}
        assert client.delete("/api/v1/responses/1").status_code == 200
    finally:
        app.dependency_overrides.clear(); asyncio.run(engine.dispose())


async def _seed(engine) -> None:
    async with engine.begin() as connection: await connection.run_sync(Base.metadata.create_all)
    sessions = async_sessionmaker(engine, expire_on_commit=False)
    async with sessions() as session:
        session.add(Creator(id=1, name="Creator", email="reports@test.dev")); form = Form(id=1, creator_id=1, title="Reports")
        questions = [Question(id=1, form=form, type=QuestionType.MULTIPLE_CHOICE, title="Choice", position=0, settings_json={"options": ["A", "B"]}), Question(id=2, form=form, type=QuestionType.RATING, title="Rating", position=1, settings_json={"min": 1, "max": 5}), Question(id=3, form=form, type=QuestionType.YES_NO, title="Yes", position=2, settings_json={})]
        first = FormResponse(id=1, form=form, form_version=1, completion_time_seconds=10, submitted_at=datetime(2026, 7, 10, 15, 1, tzinfo=timezone.utc)); second = FormResponse(id=2, form=form, form_version=1, completion_time_seconds=20, submitted_at=datetime(2026, 7, 10, 15, 0, tzinfo=timezone.utc))
        first.answers.extend([Answer(question=questions[0], value_json="A"), Answer(question=questions[1], value_json=3), Answer(question=questions[2], value_json=True)])
        session.add_all([form, *questions, first, second]); await session.commit()
