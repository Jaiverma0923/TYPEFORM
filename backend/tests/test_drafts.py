import asyncio

from fastapi.testclient import TestClient
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine

from app.db.base import Base
from app.db.database import get_db
from app.main import app
from app.models import Creator, Form, FormStatus, Question, QuestionType


def test_draft_response_routes_and_submission_cleanup(tmp_path) -> None:
    engine = create_async_engine(f"sqlite+aiosqlite:///{tmp_path / 'drafts.db'}")
    asyncio.run(_seed(engine))
    sessions = async_sessionmaker(engine, expire_on_commit=False)

    async def override_db():
        async with sessions() as session:
            yield session

    app.dependency_overrides[get_db] = override_db
    client = TestClient(app)
    try:
        empty = client.get("/api/v1/public/live/draft")
        assert empty.status_code == 200 and empty.json()["data"] is None

        created = client.post("/api/v1/public/live/draft")
        assert created.status_code == 201
        draft = created.json()["data"]
        assert draft["form_id"] == 1 and draft["slug"] == "live"
        assert draft["form_version"] == 3 and draft["answers"] == []
        assert draft["current_question_id"] == 1 and draft["visited_question_ids"] == [1]
        assert draft["completed"] is False and draft["started_at"].endswith("Z")

        repeated = client.post("/api/v1/public/live/draft")
        assert repeated.status_code == 201 and repeated.json()["data"]["id"] == draft["id"]
        assert client.get("/api/v1/public/live/draft").json()["data"]["id"] == draft["id"]

        updated = client.patch(f"/api/v1/drafts/{draft['id']}", json={"form_version": 3, "answers": [{"question_id": 1, "value": "saved"}], "current_question_id": 2, "visited_question_ids": [1, 2], "started_at": "2026-07-11T10:00:00.000Z", "completed": False})
        assert updated.status_code == 200
        updated_data = updated.json()["data"]
        assert updated_data["answers"] == [{"question_id": 1, "value": "saved"}]
        assert updated_data["current_question_id"] == 2 and updated_data["visited_question_ids"] == [1, 2]
        assert updated_data["started_at"].startswith("2026-07-11T10:00:00") and updated_data["started_at"].endswith("Z")

        partial = client.patch(f"/api/v1/drafts/{draft['id']}", json={"completed": True})
        assert partial.status_code == 200
        assert partial.json()["data"]["completed"] is True
        assert partial.json()["data"]["answers"] == [{"question_id": 1, "value": "saved"}]

        assert client.patch(f"/api/v1/drafts/{draft['id']}", json={"form_version": 2}).status_code == 409
        assert client.patch(f"/api/v1/drafts/{draft['id']}", json={"current_question_id": 99}).status_code == 422
        assert client.get("/api/v1/public/missing/draft").status_code == 404
        assert client.patch("/api/v1/drafts/9999", json={"completed": False}).status_code == 404

        other = client.post("/api/v1/public/other/draft").json()["data"]
        assert client.patch(f"/api/v1/drafts/{other['id']}", json={"answers": [{"question_id": 1, "value": "wrong form"}]}).status_code == 422

        deleted = client.delete(f"/api/v1/drafts/{other['id']}")
        assert deleted.status_code == 200 and deleted.json()["data"] == {"id": other["id"]}

        submitted = client.post("/api/v1/public/forms/live/responses", json={"answers": [{"question_id": 1, "value": "submitted"}], "form_version": 3})
        assert submitted.status_code == 201
        assert client.get("/api/v1/public/live/draft").json()["data"] is None
    finally:
        app.dependency_overrides.clear()
        asyncio.run(engine.dispose())


async def _seed(engine) -> None:
    async with engine.begin() as connection:
        await connection.run_sync(Base.metadata.create_all)
    sessions = async_sessionmaker(engine, expire_on_commit=False)
    async with sessions() as session:
        session.add(Creator(id=1, name="Creator", email="creator@test.dev"))
        session.add_all([
            Form(id=1, creator_id=1, title="Live", slug="live", status=FormStatus.PUBLISHED, version=3),
            Form(id=2, creator_id=1, title="Other", slug="other", status=FormStatus.PUBLISHED, version=1),
        ])
        session.add_all([
            Question(id=1, form_id=1, type=QuestionType.SHORT_TEXT, title="First", position=0),
            Question(id=2, form_id=1, type=QuestionType.SHORT_TEXT, title="Second", position=1),
            Question(id=3, form_id=2, type=QuestionType.SHORT_TEXT, title="Other", position=0),
        ])
        await session.commit()
