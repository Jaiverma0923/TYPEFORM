import re
from typing import Literal

from pydantic import Field, field_validator

from app.schemas.common import ORMModel

HEX_COLOR = re.compile(r"^#[0-9a-fA-F]{6}$")
FONT_FAMILIES = ("Inter", "Poppins", "DM Sans", "Manrope", "System")


class ThemeColorsUpdate(ORMModel):
    primary: str | None = None
    background: str | None = None
    surface: str | None = None
    text: str | None = None
    border: str | None = None
    accent: str | None = None

    @field_validator("primary", "background", "surface", "text", "border", "accent")
    @classmethod
    def valid_hex_color(cls, value: str | None) -> str | None:
        if value is not None and not HEX_COLOR.fullmatch(value):
            raise ValueError("Must be a valid hex color in #RRGGBB format")
        return value


class ThemeTypographyUpdate(ORMModel):
    font_family: Literal["Inter", "Poppins", "DM Sans", "Manrope", "System"] | None = None
    heading_weight: int | None = None
    body_weight: int | None = None


class ThemeBackgroundUpdate(ORMModel):
    type: Literal["solid", "gradient"] | None = None
    value: str | None = None


class ThemeButtonsUpdate(ORMModel):
    radius: int | None = Field(default=None, ge=0, le=24)
    style: Literal["filled", "outline"] | None = None


class ThemeInputsUpdate(ORMModel):
    radius: int | None = Field(default=None, ge=0, le=24)


class FormThemeUpdate(ORMModel):
    name: str | None = None
    colors: ThemeColorsUpdate | None = None
    typography: ThemeTypographyUpdate | None = None
    background: ThemeBackgroundUpdate | None = None
    buttons: ThemeButtonsUpdate | None = None
    inputs: ThemeInputsUpdate | None = None
