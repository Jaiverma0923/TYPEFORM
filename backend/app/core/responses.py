from typing import Any


def success_response(message: str, data: Any) -> dict[str, Any]:
    """Return the API contract success wrapper."""
    return {"success": True, "message": message, "data": data}


def error_response(message: str, errors: list[Any] | None = None) -> dict[str, Any]:
    """Return the API contract error wrapper."""
    return {"success": False, "message": message, "errors": errors if errors is not None else []}
