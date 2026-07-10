import asyncio

from fastapi.testclient import TestClient
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine

from app.db.base import Base
from app.db.database import get_db
from app.main import app
from app.models import Form, FormResponse, Question, QuestionType


def test_form_routes(tmp_path) -> None:
    engine = create_async_engine(f"sqlite+aiosqlite:///{tmp_path / 'forms.db'}")
    asyncio.run(_create(engine))
    sessions = async_sessionmaker(engine, expire_on_commit=False)

    async def override_db():
        async with sessions() as session:
            yield session

    app.dependency_overrides[get_db] = override_db
    client = TestClient(app)
    try:
        created = client.post("/api/v1/forms", json={"title": "  Customer Feedback  ", "description": "Help us improve"})
        assert created.status_code == 201
        form = created.json()["data"]
        assert form["title"] == "Customer Feedback" and form["status"] == "draft" and form["question_count"] == 0
        assert form["created_at"].endswith("Z") and form["updated_at"].endswith("Z")
        form_id = form["id"]
        assert client.post("/api/v1/forms", json={"title": "Second Form"}).status_code == 201
        assert client.get("/api/v1/forms", params={"search": "feedback"}).json()["data"]["pagination"]["total"] == 1
        page = client.get("/api/v1/forms", params={"page": 1, "limit": 1}).json()["data"]
        assert len(page["items"]) == 1 and page["pagination"]["total_pages"] == 2
        assert client.get("/api/v1/forms", params={"status": "published", "page": 1, "limit": 1}).json()["data"]["items"] == []
        assert client.patch(f"/api/v1/forms/{form_id}", json={"title": " Updated "}).json()["data"]["version"] == 2
        assert client.patch(f"/api/v1/forms/{form_id}", json={"title": "   "}).status_code == 422
        assert client.post(f"/api/v1/forms/{form_id}/publish").status_code == 422

        asyncio.run(_add_question(engine, form_id))
        detail = client.get(f"/api/v1/forms/{form_id}").json()["data"]
        assert detail["questions"][0]["settings"] == {"options": ["A"]}
        published = client.post(f"/api/v1/forms/{form_id}/publish").json()["data"]
        assert published["slug"] and published["public_url"].endswith(published["slug"])
        same_slug = client.post(f"/api/v1/forms/{form_id}/publish").json()["data"]["slug"]
        assert same_slug == published["slug"]
        duplicate = client.post(f"/api/v1/forms/{form_id}/duplicate", json={}).json()["data"]
        assert duplicate["status"] == "draft" and duplicate["slug"] is None and len(duplicate["questions"]) == 1
        assert client.post(f"/api/v1/forms/{form_id}/unpublish").json()["data"]["status"] == "draft"
        assert client.get("/api/v1/forms/99999").status_code == 404
        assert client.delete(f"/api/v1/forms/{form_id}").json()["data"] is None
    finally:
        app.dependency_overrides.clear()
        asyncio.run(engine.dispose())


async def _create(engine) -> None:
    async with engine.begin() as connection:
        await connection.run_sync(Base.metadata.create_all)


async def _add_question(engine, form_id: int) -> None:
    sessions = async_sessionmaker(engine, expire_on_commit=False)
    async with sessions() as session:
        session.add(Question(form_id=form_id, type=QuestionType.MULTIPLE_CHOICE, title="Choose", position=0, settings_json={"options": ["A"]}))
        session.add(FormResponse(form_id=form_id, form_version=1))
        await session.commit()
