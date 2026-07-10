from datetime import datetime, timezone

import pytest
from sqlalchemy import select
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine

from app.db.base import Base
from app.models import Answer, Creator, Form, FormResponse, Question, QuestionType
from app.schemas.question import QuestionResponse


@pytest.mark.asyncio
async def test_relationships_cascade_and_question_serialization(tmp_path) -> None:
    engine = create_async_engine(f"sqlite+aiosqlite:///{tmp_path / 'models.db'}")
    async with engine.begin() as connection:
        await connection.run_sync(Base.metadata.create_all)
    sessions = async_sessionmaker(engine, expire_on_commit=False)

    async with sessions() as session:
        creator = Creator(name="Default Creator", email="creator@example.com")
        form = Form(creator=creator, title="Feedback")
        later = Question(form=form, type=QuestionType.SHORT_TEXT, title="Later", position=1, settings_json={"placeholder": "Later"})
        first = Question(form=form, type=QuestionType.RATING, title="First", position=0, settings_json={"min": 1, "max": 5})
        response = FormResponse(form=form, form_version=1, completion_time_seconds=10)
        response.answers.append(Answer(question=first, value_json=5))
        session.add_all([creator, form, later, first, response])
        await session.commit()

        serialized = QuestionResponse.model_validate(first).model_dump()
        assert serialized["settings"] == {"options": None, "min": 1, "max": 5, "placeholder": None}
        assert "settings_json" not in serialized
        assert serialized["version"] == 1
        assert serialized["updated_at"].isoformat().startswith(datetime.now(timezone.utc).date().isoformat())

        form.responses.remove(response)
        await session.commit()
        assert (await session.scalars(select(Answer))).all() == []

        replacement_response = FormResponse(form=form, form_version=1)
        replacement_response.answers.append(Answer(question=first, value_json="replacement"))
        session.add(replacement_response)
        await session.commit()

        loaded_form = await session.scalar(select(Form).where(Form.id == form.id))
        assert loaded_form is not None
        await session.refresh(loaded_form, ["questions"])
        assert [question.position for question in loaded_form.questions] == [0, 1]
        await session.delete(loaded_form)
        await session.commit()

        assert (await session.scalars(select(Question))).all() == []
        assert (await session.scalars(select(FormResponse))).all() == []
        assert (await session.scalars(select(Answer))).all() == []

    await engine.dispose()
