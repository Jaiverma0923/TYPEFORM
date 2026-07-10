from functools import lru_cache

from pydantic import AliasChoices, Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Runtime settings loaded from environment variables or a local .env file."""

    app_name: str = "Typeform Clone API"
    app_env: str = "development"
    app_host: str = "0.0.0.0"
    app_port: int = 8000
    database_url: str = "sqlite+aiosqlite:///./typeform.db"
    frontend_url: str = "http://localhost:3000"
    frontend_base_url: str = Field(default="http://localhost:3000", validation_alias=AliasChoices("FRONTEND_BASE_URL", "FRONTEND_URL"))
    backend_url: str = "http://localhost:8000"
    backend_base_url: str = "http://localhost:8000"
    secret_key: str = "replace-with-secure-value"
    log_level: str = "INFO"
    api_v1_prefix: str = "/api/v1"

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")


@lru_cache
def get_settings() -> Settings:
    return Settings()
