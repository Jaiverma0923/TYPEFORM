import asyncio

from fastapi.testclient import TestClient
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine

from app.db.base import Base
from app.db.database import get_db
from app.main import app
from app.models import Answer, Creator, Form, FormResponse, FormStatus, Question, QuestionType


def test_public_form_and_submission(tmp_path) -> None:
    engine = create_async_engine(f"sqlite+aiosqlite:///{tmp_path / 'public.db'}"); asyncio.run(_seed(engine))
    sessions = async_sessionmaker(engine, expire_on_commit=False)
    async def override_db():
        async with sessions() as session: yield session
    app.dependency_overrides[get_db] = override_db; client = TestClient(app)
    try:
        public = client.get("/api/v1/public/forms/live")
        assert public.status_code == 200 and [q["position"] for q in public.json()["data"]["questions"]] == list(range(8))
        assert client.get("/api/v1/public/forms/draft").status_code == 404
        assert client.get("/api/v1/public/forms/missing").status_code == 404
        answers = [{"question_id": index + 1, "value": value} for index, value in enumerate(["x", "long", "a@b.com", 3, "A", "B", True, 4])]
        ok = client.post("/api/v1/public/forms/live/responses", json={"answers": answers, "completion_time_seconds": 4, "form_version": 3})
        assert ok.status_code == 201 and ok.json()["data"]["thank_you"]["title"] == "Thanks"
        assert client.post("/api/v1/public/forms/live/responses", json={"answers": answers, "form_version": 2}).status_code == 409
        assert client.post("/api/v1/public/forms/live/responses", json={"answers": answers[:-1]}).status_code == 422
        bad = answers.copy(); bad[2] = {"question_id": 3, "value": "invalid"}
        assert client.post("/api/v1/public/forms/live/responses", json={"answers": bad}).status_code == 422
        bad = answers.copy(); bad[6] = {"question_id": 7, "value": "yes"}
        assert client.post("/api/v1/public/forms/live/responses", json={"answers": bad}).status_code == 422
        bad = answers.copy(); bad[7] = {"question_id": 8, "value": 9}
        assert client.post("/api/v1/public/forms/live/responses", json={"answers": bad}).status_code == 422
        assert client.post("/api/v1/public/forms/live/responses", json={"answers": answers + [answers[0]]}).status_code == 422
        assert client.post("/api/v1/public/forms/live/responses", json={"answers": [{"question_id": 999, "value": "x"}]}).status_code == 422
        assert asyncio.run(_counts(engine)) == (1, 8)
    finally:
        app.dependency_overrides.clear(); asyncio.run(engine.dispose())


async def _seed(engine) -> None:
    async with engine.begin() as connection: await connection.run_sync(Base.metadata.create_all)
    sessions = async_sessionmaker(engine, expire_on_commit=False)
    async with sessions() as session:
        session.add(Creator(id=1, name="Creator", email="creator@test.dev"))
        live = Form(id=1, creator_id=1, title="Live", slug="live", status=FormStatus.PUBLISHED, version=3, thank_you_title="Thanks")
        draft = Form(id=2, creator_id=1, title="Draft", slug="draft")
        types = [(QuestionType.SHORT_TEXT, {}), (QuestionType.LONG_TEXT, {}), (QuestionType.EMAIL, {}), (QuestionType.NUMBER, {"min": 1, "max": 5}), (QuestionType.MULTIPLE_CHOICE, {"options": ["A"]}), (QuestionType.DROPDOWN, {"options": ["B"]}), (QuestionType.YES_NO, {}), (QuestionType.RATING, {"min": 1, "max": 5})]
        for index, (kind, settings) in enumerate(types): session.add(Question(id=index + 1, form=live, type=kind, title=kind, required=True, position=index, settings_json=settings))
        session.add_all([live, draft]); await session.commit()


async def _counts(engine) -> tuple[int, int]:
    sessions = async_sessionmaker(engine)
    async with sessions() as session:
        return (await session.scalar(select(func.count()).select_from(FormResponse)) or 0, await session.scalar(select(func.count()).select_from(Answer)) or 0)
