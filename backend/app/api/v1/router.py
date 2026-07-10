from fastapi import APIRouter

from app.api.v1.routes.health import router as health_router
from app.api.v1.routes.forms import router as forms_router
from app.api.v1.routes.questions import router as questions_router
from app.api.v1.routes.public_forms import router as public_forms_router
from app.api.v1.routes.responses import router as responses_router
from app.api.v1.routes.analytics import router as analytics_router
from app.api.v1.routes.themes import router as themes_router

api_router = APIRouter()
api_router.include_router(health_router, tags=["health"])
api_router.include_router(forms_router, tags=["forms"])
api_router.include_router(questions_router, tags=["questions"])
api_router.include_router(public_forms_router, tags=["public-forms"])
api_router.include_router(responses_router, tags=["responses"])
api_router.include_router(analytics_router, tags=["analytics"])
api_router.include_router(themes_router, tags=["themes"])
