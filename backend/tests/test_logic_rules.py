import asyncio

from fastapi.testclient import TestClient
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine

from app.db.base import Base
from app.db.database import get_db
from app.main import app
from app.models import Creator, Form, FormStatus, FormTheme, Question, QuestionType
from app.services.theme_service import DEFAULT_THEME


def test_logic_rule_routes_validation_and_payloads(tmp_path) -> None:
    engine = create_async_engine(f"sqlite+aiosqlite:///{tmp_path / 'logic-rules.db'}")
    asyncio.run(_seed(engine))
    sessions = async_sessionmaker(engine, expire_on_commit=False)

    async def override_db():
        async with sessions() as session:
            yield session

    app.dependency_overrides[get_db] = override_db
    client = TestClient(app)
    try:
        first = client.post("/api/v1/forms/1/logic-rules", json={"source_question_id": 1, "operator": "equals", "value": "yes", "action": "go_to_question", "target_question_id": 2})
        assert first.status_code == 201
        rule_one = first.json()["data"]
        assert rule_one["form_id"] == 1 and rule_one["priority"] == 0
        assert rule_one["target_question_id"] == 2 and rule_one["value"] == "yes"

        second = client.post("/api/v1/forms/1/logic-rules", json={"source_question_id": 2, "operator": "is_answered", "value": None, "action": "submit_form", "target_question_id": None})
        assert second.status_code == 201
        rule_two = second.json()["data"]
        assert rule_two["priority"] == 1
        assert [item["id"] for item in client.get("/api/v1/forms/1/logic-rules").json()["data"]] == [rule_one["id"], rule_two["id"]]

        updated = client.patch(f"/api/v1/logic-rules/{rule_one['id']}", json={"operator": "contains", "value": "ye"})
        assert updated.status_code == 200
        assert updated.json()["data"]["operator"] == "contains"

        assert client.get("/api/v1/forms/1").json()["data"]["logic_rules"][0]["id"] == rule_one["id"]
        assert client.get("/api/v1/public/forms/live").json()["data"]["logic_rules"][1]["id"] == rule_two["id"]

        reordered = client.patch("/api/v1/forms/1/logic-rules/reorder", json={"rule_ids": [rule_two["id"], rule_one["id"]]})
        assert reordered.status_code == 200
        assert reordered.json()["data"] == {"rule_ids": [rule_two["id"], rule_one["id"]], "form_id": 1}
        assert [item["id"] for item in client.get("/api/v1/forms/1/logic-rules").json()["data"]] == [rule_two["id"], rule_one["id"]]

        assert client.patch("/api/v1/forms/1/logic-rules/reorder", json={"rule_ids": [rule_one["id"], rule_one["id"]]}).status_code == 422
        assert client.patch("/api/v1/forms/1/logic-rules/reorder", json={"rule_ids": [rule_one["id"]]}).status_code == 422
        assert client.post("/api/v1/forms/1/logic-rules", json={"source_question_id": 99, "operator": "equals", "value": "x", "action": "submit_form", "target_question_id": None}).status_code == 422
        assert client.post("/api/v1/forms/1/logic-rules", json={"source_question_id": 1, "operator": "equals", "value": "x", "action": "go_to_question", "target_question_id": 3}).status_code == 422
        assert client.post("/api/v1/forms/1/logic-rules", json={"source_question_id": 1, "operator": "invalid", "value": "x", "action": "submit_form", "target_question_id": None}).status_code == 422
        assert client.post("/api/v1/forms/1/logic-rules", json={"source_question_id": 1, "operator": "equals", "value": "x", "action": "go_to_question", "target_question_id": 1}).status_code == 422

        deleted = client.delete(f"/api/v1/logic-rules/{rule_one['id']}")
        assert deleted.status_code == 200 and deleted.json()["data"] == {"id": rule_one["id"]}
        assert [item["id"] for item in client.get("/api/v1/forms/1/logic-rules").json()["data"]] == [rule_two["id"]]
    finally:
        app.dependency_overrides.clear()
        asyncio.run(engine.dispose())


async def _seed(engine) -> None:
    async with engine.begin() as connection:
        await connection.run_sync(Base.metadata.create_all)
    sessions = async_sessionmaker(engine, expire_on_commit=False)
    async with sessions() as session:
        session.add(Creator(id=1, name="Creator", email="creator@test.dev"))
        form = Form(id=1, creator_id=1, title="Live", slug="live", status=FormStatus.PUBLISHED)
        other = Form(id=2, creator_id=1, title="Other", slug="other")
        form.theme = FormTheme(**DEFAULT_THEME)
        other.theme = FormTheme(**DEFAULT_THEME)
        session.add_all([form, other])
        session.add_all([
            Question(id=1, form_id=1, type=QuestionType.SHORT_TEXT, title="First", position=0),
            Question(id=2, form_id=1, type=QuestionType.SHORT_TEXT, title="Second", position=1),
            Question(id=3, form_id=2, type=QuestionType.SHORT_TEXT, title="Other", position=0),
        ])
        await session.commit()
