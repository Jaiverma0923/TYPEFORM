"""Idempotent development seed command: python -m app.db.seed."""

import asyncio

from sqlalchemy import select

from app.db.database import AsyncSessionLocal
from app.models import Answer, Creator, Form, FormResponse, FormStatus, Question, QuestionType


async def seed() -> None:
    async with AsyncSessionLocal() as db:
        creator = await db.get(Creator, 1)
        if creator is None:
            db.add(Creator(id=1, name="Default Creator", email="creator@example.com"))
        feedback = await db.scalar(select(Form).where(Form.slug == "customer-feedback-demo"))
        if feedback is None:
            feedback = Form(creator_id=1, title="Customer Feedback", description="Help us improve", slug="customer-feedback-demo", status=FormStatus.PUBLISHED, version=3, thank_you_title="Thank you!", thank_you_message="Your response has been recorded.")
            feedback.questions.extend([
                Question(type=QuestionType.SHORT_TEXT, title="What is your name?", required=True, position=0, settings_json={"placeholder": "Type your name"}),
                Question(type=QuestionType.EMAIL, title="What is your email?", required=True, position=1, settings_json={"placeholder": "you@example.com"}),
                Question(type=QuestionType.MULTIPLE_CHOICE, title="Which service did you use?", required=True, position=2, settings_json={"options": ["Delivery", "Pickup"]}),
                Question(type=QuestionType.RATING, title="Rate your experience", required=True, position=3, settings_json={"min": 1, "max": 5}),
                Question(type=QuestionType.YES_NO, title="Would you recommend us?", required=True, position=4, settings_json={}),
            ])
            db.add(feedback); await db.flush()
            questions = sorted(feedback.questions, key=lambda item: item.position)
            for name, email, service, rating, recommend, seconds in [("Raghav Singh", "raghav@example.com", "Delivery", 5, True, 74), ("Asha Patel", "asha@example.com", "Pickup", 4, True, 60), ("Noah Roy", "noah@example.com", "Delivery", 3, False, 90)]:
                response = FormResponse(form=feedback, form_version=3, completion_time_seconds=seconds)
                response.answers.extend([Answer(question=questions[0], value_json=name), Answer(question=questions[1], value_json=email), Answer(question=questions[2], value_json=service), Answer(question=questions[3], value_json=rating), Answer(question=questions[4], value_json=recommend)])
                db.add(response)
        event = await db.scalar(select(Form).where(Form.title == "Event Registration"))
        if event is None:
            event = Form(creator_id=1, title="Event Registration", description="Register for our event", status=FormStatus.DRAFT)
            event.questions.extend([
                Question(type=QuestionType.LONG_TEXT, title="Tell us what you hope to learn", position=0, settings_json={"placeholder": "Your goals"}),
                Question(type=QuestionType.NUMBER, title="How many tickets?", position=1, settings_json={"min": 1, "max": 10}),
                Question(type=QuestionType.DROPDOWN, title="Choose a session", position=2, settings_json={"options": ["Morning", "Afternoon"]}),
            ])
            db.add(event)
        await db.commit()
    print("Seed complete: forms 1/2; public slug customer-feedback-demo")


if __name__ == "__main__":
    asyncio.run(seed())
