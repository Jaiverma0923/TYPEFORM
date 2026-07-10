from datetime import datetime, timezone
import re
from typing import Any


def format_utc_timestamp(value: datetime) -> str:
    """Serialize a naive or aware datetime as ISO 8601 UTC with microseconds."""
    if value.tzinfo is None:
        value = value.replace(tzinfo=timezone.utc)
    else:
        value = value.astimezone(timezone.utc)
    return value.strftime("%Y-%m-%dT%H:%M:%S.%fZ")


_ISO_TIMESTAMP = re.compile(r"^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})?$")


def normalize_timestamp_payload(value: Any) -> Any:
    """Recursively normalize serialized JSON datetime strings using the shared formatter."""
    if isinstance(value, dict):
        return {key: normalize_timestamp_payload(item) for key, item in value.items()}
    if isinstance(value, list):
        return [normalize_timestamp_payload(item) for item in value]
    if isinstance(value, str) and _ISO_TIMESTAMP.fullmatch(value):
        return format_utc_timestamp(datetime.fromisoformat(value.replace("Z", "+00:00")))
    return value
