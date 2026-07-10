from fastapi import APIRouter

from app.core.responses import success_response

router = APIRouter()


@router.get("/health", summary="Check API health")
def health_check() -> dict:
    return success_response("API is healthy", {"status": "ok"})
