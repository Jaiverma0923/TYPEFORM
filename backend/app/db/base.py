from datetime import datetime, timezone

from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    """Base class for all ORM entities."""


def utc_now() -> datetime:
    return datetime.now(timezone.utc)
