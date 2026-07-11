import pytest
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine

from app.db.base import Base
from app.db.seed import seed_database
from app.models import Answer, Form, FormResponse, FormTheme, LogicRule, Question


@pytest.mark.asyncio
async def test_seed_database_creates_demo_data_once(tmp_path) -> None:
    engine = create_async_engine(f"sqlite+aiosqlite:///{tmp_path / 'seed.db'}")
    async with engine.begin() as connection:
        await connection.run_sync(Base.metadata.create_all)
    sessions = async_sessionmaker(engine, expire_on_commit=False)

    async with sessions() as session:
        await seed_database(session)

    async with sessions() as session:
        counts = tuple([
            await session.scalar(select(func.count(model.id)))
            for model in (Form, Question, FormResponse, Answer, LogicRule, FormTheme)
        ])
        assert counts == (2, 8, 5, 39, 1, 1)

    async with sessions() as session:
        await seed_database(session)

    async with sessions() as session:
        repeated_counts = tuple([
            await session.scalar(select(func.count(model.id)))
            for model in (Form, Question, FormResponse, Answer, LogicRule, FormTheme)
        ])
        assert repeated_counts == counts

    await engine.dispose()
