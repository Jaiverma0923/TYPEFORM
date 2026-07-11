"""Idempotent development database seed data."""

import asyncio
from datetime import datetime, timedelta, timezone

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.database import AsyncSessionLocal
from app.models import (
    Answer,
    Creator,
    Form,
    FormResponse,
    FormStatus,
    FormTheme,
    LogicRule,
    Question,
    QuestionType,
)
from app.services.theme_service import DEFAULT_THEME


async def seed_database(session: AsyncSession) -> None:
    """Seed the empty database once with demo data."""
    try:
        async with session.begin():
            if await session.scalar(select(Form.id).limit(1)) is not None:
                return

            creator = Creator(id=1, name="Demo User", email="demo@example.com")
            feedback = Form(
                creator=creator,
                title="Customer Feedback Survey",
                description="Help us improve our services.",
                slug="customer-feedback-survey-demo",
                status=FormStatus.PUBLISHED,
                version=1,
                thank_you_title="Thank you!",
                thank_you_message="Your response has been recorded.",
                published_at=datetime.now(timezone.utc),
            )
            feedback.theme = FormTheme(**DEFAULT_THEME)
            feedback.questions.extend(
                [
                    Question(
                        type=QuestionType.SHORT_TEXT,
                        title="What is your name?",
                        description="Please share your name.",
                        required=True,
                        position=0,
                        settings_json={"placeholder": "Your name"},
                    ),
                    Question(
                        type=QuestionType.EMAIL,
                        title="What is your email address?",
                        description="We will only use this to follow up if needed.",
                        required=True,
                        position=1,
                        settings_json={"placeholder": "you@example.com"},
                    ),
                    Question(
                        type=QuestionType.MULTIPLE_CHOICE,
                        title="Which service did you use?",
                        description="Choose the service you used most recently.",
                        required=True,
                        position=2,
                        settings_json={"options": ["Delivery", "Pickup", "In-store"]},
                    ),
                    Question(
                        type=QuestionType.DROPDOWN,
                        title="How often do you use our services?",
                        description=None,
                        required=True,
                        position=3,
                        settings_json={"options": ["First time", "Occasionally", "Monthly", "Weekly"]},
                    ),
                    Question(
                        type=QuestionType.NUMBER,
                        title="How many items did you purchase?",
                        description=None,
                        required=False,
                        position=4,
                        settings_json={"min": 1, "max": 10, "placeholder": "1"},
                    ),
                    Question(
                        type=QuestionType.YES_NO,
                        title="Would you recommend us?",
                        description=None,
                        required=True,
                        position=5,
                        settings_json={},
                    ),
                    Question(
                        type=QuestionType.LONG_TEXT,
                        title="What could we improve?",
                        description="Tell us how we can do better.",
                        required=False,
                        position=6,
                        settings_json={"placeholder": "Share your feedback"},
                    ),
                    Question(
                        type=QuestionType.RATING,
                        title="How would you rate your experience?",
                        description=None,
                        required=True,
                        position=7,
                        settings_json={"min": 1, "max": 5},
                    ),
                ],
            )
            event = Form(
                creator=creator,
                title="Event Registration",
                description="Internal draft form.",
                status=FormStatus.DRAFT,
            )
            session.add_all([creator, feedback, event])
            await session.flush()

            questions = {question.type: question for question in feedback.questions}
            session.add(
                LogicRule(
                    form_id=feedback.id,
                    source_question_id=questions[QuestionType.YES_NO].id,
                    destination_question_id=questions[QuestionType.LONG_TEXT].id,
                    operator="equals",
                    comparison_value=False,
                    action="go_to_question",
                    priority=0,
                ),
            )

            responses = [
                ("Raghav Singh", "raghav@example.com", "Delivery", "Weekly", 3, True, "Everything was smooth.", 5, 31, 2),
                ("Asha Patel", "asha@example.com", "Pickup", "Monthly", 2, True, "Fast and friendly service.", 4, 52, 4),
                ("Noah Roy", "noah@example.com", "In-store", "Occasionally", 1, False, "The checkout line was too long.", 3, 81, 6),
                ("Meera Shah", "meera@example.com", "Delivery", "First time", 4, True, None, 5, 102, 9),
                ("Ishan Kumar", "ishan@example.com", "Pickup", "Weekly", 2, False, "Please add more pickup time slots.", 2, 126, 12),
            ]
            now = datetime.now(timezone.utc)
            for name, email, service, frequency, quantity, recommend, improvement, rating, seconds, days_ago in responses:
                response = FormResponse(
                    form=feedback,
                    form_version=feedback.version,
                    completion_time_seconds=seconds,
                    submitted_at=now - timedelta(days=days_ago),
                )
                values = {
                    QuestionType.SHORT_TEXT: name,
                    QuestionType.EMAIL: email,
                    QuestionType.MULTIPLE_CHOICE: service,
                    QuestionType.DROPDOWN: frequency,
                    QuestionType.NUMBER: quantity,
                    QuestionType.YES_NO: recommend,
                    QuestionType.RATING: rating,
                }
                if improvement is not None:
                    values[QuestionType.LONG_TEXT] = improvement
                response.answers.extend(
                    Answer(question=questions[question_type], value_json=value)
                    for question_type, value in values.items()
                )
                session.add(response)
    except Exception:
        await session.rollback()
        raise


async def seed() -> None:
    async with AsyncSessionLocal() as session:
        await seed_database(session)


if __name__ == "__main__":
    asyncio.run(seed())
