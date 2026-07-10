import asyncio
import csv
import io

from fastapi.testclient import TestClient
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine

from app.db.base import Base
from app.db.database import get_db
from app.main import app
from app.models import Answer, Creator, Form, FormResponse, Question, QuestionType


def test_csv_export(tmp_path) -> None:
    engine = create_async_engine(f"sqlite+aiosqlite:///{tmp_path / 'csv.db'}"); asyncio.run(_seed(engine))
    sessions = async_sessionmaker(engine, expire_on_commit=False)
    async def override_db():
        async with sessions() as session: yield session
    app.dependency_overrides[get_db] = override_db; client = TestClient(app)
    try:
        response = client.get("/api/v1/forms/1/responses/export")
        assert response.status_code == 200 and response.headers["content-type"].startswith("text/csv")
        rows = list(csv.reader(io.StringIO(response.text)))
        assert rows[0] == ["response_id", "submitted_at", "completion_time_seconds", "Second [2]", "First [1]"]
        assert rows[1][1].endswith("Z") and len(rows[1][1].split(".")[1]) == 7
        assert rows[1][3:] == ["'=danger, \"quoted\"", "Yes"]
        assert client.get("/api/v1/forms/999/responses/export").status_code == 404
        assert client.delete("/api/v1/responses/1").status_code == 200
        assert len(list(csv.reader(io.StringIO(client.get("/api/v1/forms/1/responses/export").text)))) == 1
    finally:
        app.dependency_overrides.clear(); asyncio.run(engine.dispose())


async def _seed(engine) -> None:
    async with engine.begin() as connection: await connection.run_sync(Base.metadata.create_all)
    sessions = async_sessionmaker(engine, expire_on_commit=False)
    async with sessions() as session:
        session.add(Creator(id=1, name="Creator", email="csv@test.dev")); form = Form(id=1, creator_id=1, title="CSV Form")
        second = Question(id=2, form=form, type=QuestionType.SHORT_TEXT, title="Second", position=0, settings_json={})
        first = Question(id=1, form=form, type=QuestionType.YES_NO, title="First", position=1, settings_json={})
        response = FormResponse(id=1, form=form, form_version=1)
        response.answers.extend([Answer(question=second, value_json='=danger, "quoted"'), Answer(question=first, value_json=True)])
        session.add_all([form, second, first, response]); await session.commit()
