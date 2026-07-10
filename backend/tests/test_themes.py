import asyncio

from fastapi.testclient import TestClient
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine

from app.db.base import Base
from app.db.database import get_db
from app.main import app
from app.models import Creator, Form, FormStatus


def test_form_theme_routes_and_payloads(tmp_path) -> None:
    engine = create_async_engine(f"sqlite+aiosqlite:///{tmp_path / 'themes.db'}")
    asyncio.run(_seed(engine))
    sessions = async_sessionmaker(engine, expire_on_commit=False)

    async def override_db():
        async with sessions() as session:
            yield session

    app.dependency_overrides[get_db] = override_db
    client = TestClient(app)
    try:
        initial = client.get("/api/v1/forms/1/theme")
        assert initial.status_code == 200
        default = initial.json()["data"]
        assert default["colors"]["primary"] == "#262626"
        assert default["typography"]["font_family"] == "Inter"
        assert default["buttons"] == {"radius": 8, "style": "filled"}

        updated = client.patch("/api/v1/forms/1/theme", json={"colors": {"primary": "#123456"}, "typography": {"font_family": "Poppins"}, "buttons": {"radius": 12, "style": "outline"}})
        assert updated.status_code == 200
        theme = updated.json()["data"]
        assert theme["colors"]["primary"] == "#123456"
        assert theme["colors"]["accent"] == "#f59e0b"
        assert theme["typography"]["font_family"] == "Poppins"
        assert theme["buttons"] == {"radius": 12, "style": "outline"}

        assert client.patch("/api/v1/forms/1/theme", json={"colors": {"primary": "blue"}}).status_code == 422
        assert client.patch("/api/v1/forms/1/theme", json={"typography": {"font_family": "Comic Sans"}}).status_code == 422
        assert client.patch("/api/v1/forms/1/theme", json={"buttons": {"radius": 25}}).status_code == 422
        assert client.patch("/api/v1/forms/1/theme", json={"buttons": {"style": "ghost"}}).status_code == 422

        assert client.get("/api/v1/forms/1").json()["data"]["theme"]["id"] == theme["id"]
        assert client.get("/api/v1/public/forms/live").json()["data"]["theme"]["colors"]["primary"] == "#123456"

        reset = client.post("/api/v1/forms/1/theme/reset")
        assert reset.status_code == 200
        assert reset.json()["data"]["colors"]["primary"] == "#262626"
        assert reset.json()["data"]["typography"]["font_family"] == "Inter"
    finally:
        app.dependency_overrides.clear()
        asyncio.run(engine.dispose())


async def _seed(engine) -> None:
    async with engine.begin() as connection:
        await connection.run_sync(Base.metadata.create_all)
    sessions = async_sessionmaker(engine, expire_on_commit=False)
    async with sessions() as session:
        session.add(Creator(id=1, name="Creator", email="creator@test.dev"))
        session.add(Form(id=1, creator_id=1, title="Live", slug="live", status=FormStatus.PUBLISHED))
        await session.commit()
