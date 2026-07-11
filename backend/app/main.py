from datetime import datetime
import json
import app.models
from contextlib import asynccontextmanager

from app.db.database import engine
from app.db.base import Base
from fastapi import FastAPI
from fastapi.encoders import ENCODERS_BY_TYPE
from fastapi.exceptions import RequestValidationError
from fastapi.requests import Request
from fastapi.responses import JSONResponse, Response
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.exc import SQLAlchemyError
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.api.v1.router import api_router
from app.core.config import get_settings
from app.core.exceptions import APIError
from app.core.responses import error_response
from app.core.timestamps import format_utc_timestamp, normalize_timestamp_payload

settings = get_settings()
ENCODERS_BY_TYPE[datetime] = format_utc_timestamp

@asynccontextmanager
async def lifespan(app: FastAPI):
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
app = FastAPI(
    title=settings.app_name,
    version="1.0.0",
    lifespan=lifespan,
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_url],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(api_router, prefix=settings.api_v1_prefix)



@app.middleware("http")
async def normalize_json_timestamps(request: Request, call_next) -> Response:
    response = await call_next(request)
    if "application/json" not in response.headers.get("content-type", ""):
        return response
    body = b"".join([chunk async for chunk in response.body_iterator])
    payload = normalize_timestamp_payload(json.loads(body))
    headers = {key: value for key, value in response.headers.items() if key.lower() != "content-length"}
    return JSONResponse(content=payload, status_code=response.status_code, headers=headers)


@app.exception_handler(RequestValidationError)
async def request_validation_exception_handler(request: Request, exc: RequestValidationError) -> JSONResponse:
    errors = [
        {"field": ".".join(str(part) for part in error["loc"] if part != "body"), "message": error["msg"]}
        for error in exc.errors()
    ]
    return JSONResponse(status_code=422, content=error_response("Validation failed", errors))


@app.exception_handler(APIError)
async def api_error_exception_handler(request: Request, exc: APIError) -> JSONResponse:
    return JSONResponse(status_code=exc.status_code, content=error_response(exc.message, exc.errors))


@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request: Request, exc: StarletteHTTPException) -> JSONResponse:
    message = exc.detail if isinstance(exc.detail, str) else "Request failed"
    return JSONResponse(status_code=exc.status_code, content=error_response(message))


@app.exception_handler(SQLAlchemyError)
async def database_exception_handler(request: Request, exc: SQLAlchemyError) -> JSONResponse:
    return JSONResponse(status_code=500, content=error_response("Database error"))


@app.exception_handler(Exception)
async def unexpected_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    return JSONResponse(status_code=500, content=error_response("Internal server error"))
