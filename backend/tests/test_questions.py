import asyncio

from fastapi.testclient import TestClient
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine

from app.db.base import Base
from app.db.database import get_db
from app.main import app


def test_question_crud_and_reorder(tmp_path) -> None:
    engine = create_async_engine(f"sqlite+aiosqlite:///{tmp_path / 'questions.db'}")
    asyncio.run(_create(engine)); sessions = async_sessionmaker(engine, expire_on_commit=False)
    async def override_db():
        async with sessions() as session: yield session
    app.dependency_overrides[get_db] = override_db; client = TestClient(app)
    try:
        form_id = client.post("/api/v1/forms", json={"title": "Questions"}).json()["data"]["id"]
        created = []
        for question_type, settings in [("short_text", {"placeholder": " Name "}), ("long_text", {}), ("email", {}), ("number", {"min": 1}), ("multiple_choice", {"options": [" A ", "B"]}), ("dropdown", {"options": ["A"]}), ("yes_no", {"options": ["bad"]}), ("rating", {"min": 1, "max": 5})]:
            response = client.post(f"/api/v1/forms/{form_id}/questions", json={"type": question_type, "title": question_type, "settings": settings})
            assert response.status_code == 201; created.append(response.json()["data"])
        assert created[0]["created_at"].endswith("Z") and created[0]["updated_at"].endswith("Z")
        assert [item["position"] for item in created] == list(range(8))
        assert created[4]["settings"] == {"options": ["A", "B"]} and created[6]["settings"] == {}
        target = created[0]
        updated = client.patch(f"/api/v1/questions/{target['id']}", json={"type": "rating", "settings": {"min": 2, "max": 7}}).json()["data"]
        assert updated["settings"] == {"min": 2, "max": 7} and updated["version"] == 2
        assert client.patch(f"/api/v1/questions/{target['id']}", json={"title": " "}).status_code == 422
        assert client.post(f"/api/v1/forms/{form_id}/questions", json={"type": "dropdown", "title": "bad", "settings": {"options": ["A", " A "]}}).status_code == 422
        assert client.post(f"/api/v1/forms/{form_id}/questions", json={"type": "rating", "title": "bad", "settings": {"min": 5, "max": 1}}).status_code == 422
        ids = [item["id"] for item in created]
        reordered = client.patch(f"/api/v1/forms/{form_id}/questions/reorder", json={"question_ids": list(reversed(ids))})
        assert reordered.status_code == 200 and [item["id"] for item in reordered.json()["data"]["questions"]] == list(reversed(ids))
        assert client.patch(f"/api/v1/forms/{form_id}/questions/reorder", json={"question_ids": ids[:-1]}).status_code == 422
        assert client.patch(f"/api/v1/forms/{form_id}/questions/reorder", json={"question_ids": ids[:-1] + [ids[0]]}).status_code == 422
        assert client.patch(f"/api/v1/forms/{form_id}/questions/reorder", json={"question_ids": ids[:-1] + [99999]}).status_code == 422
        assert client.delete(f"/api/v1/questions/{ids[3]}").status_code == 200
        detail = client.get(f"/api/v1/forms/{form_id}").json()["data"]
        assert [item["position"] for item in detail["questions"]] == list(range(7))
    finally:
        app.dependency_overrides.clear(); asyncio.run(engine.dispose())


async def _create(engine) -> None:
    async with engine.begin() as connection: await connection.run_sync(Base.metadata.create_all)
