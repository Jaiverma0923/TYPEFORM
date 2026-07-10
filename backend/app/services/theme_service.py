from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.core.exceptions import NotFoundError
from app.models import Form, FormTheme
from app.schemas.theme import FormThemeUpdate

DEFAULT_THEME = {
    "name": "Default",
    "primary_color": "#262626",
    "secondary_color": "#f59e0b",
    "background_color": "#ffffff",
    "surface_color": "#ffffff",
    "text_color": "#1c1917",
    "border_color": "#e7e5e4",
    "font_family": "Inter",
    "heading_weight": 700,
    "body_weight": 400,
    "background_type": "solid",
    "background_value": "#ffffff",
    "border_radius": 8,
    "input_radius": 8,
    "button_style": "filled",
}


def theme_data(theme: FormTheme) -> dict:
    return {
        "id": theme.id,
        "form_id": theme.form_id,
        "name": theme.name,
        "colors": {"primary": theme.primary_color, "background": theme.background_color, "surface": theme.surface_color, "text": theme.text_color, "border": theme.border_color, "accent": theme.secondary_color},
        "typography": {"font_family": theme.font_family, "heading_weight": theme.heading_weight, "body_weight": theme.body_weight},
        "background": {"type": theme.background_type, "value": theme.background_value},
        "buttons": {"radius": theme.border_radius, "style": theme.button_style},
        "inputs": {"radius": theme.input_radius},
        "created_at": theme.created_at,
        "updated_at": theme.updated_at,
    }


async def ensure_theme(db: AsyncSession, form: Form) -> FormTheme:
    if form.theme is None:
        form.theme = FormTheme(**DEFAULT_THEME)
        await db.commit()
        await db.refresh(form, attribute_names=["theme"])
    return form.theme


async def _form_theme(db: AsyncSession, form_id: int) -> FormTheme:
    result = await db.execute(select(Form).options(selectinload(Form.theme)).where(Form.id == form_id))
    form = result.scalar_one_or_none()
    if form is None or form.creator_id != 1:
        raise NotFoundError("Form not found")
    return await ensure_theme(db, form)


async def get_theme(db: AsyncSession, form_id: int) -> dict:
    return theme_data(await _form_theme(db, form_id))


async def update_theme(db: AsyncSession, form_id: int, payload: FormThemeUpdate) -> dict:
    theme = await _form_theme(db, form_id)
    changes = payload.model_dump(exclude_unset=True, exclude_none=True)
    if "name" in changes:
        theme.name = changes["name"]
    for field, attribute in {"primary": "primary_color", "background": "background_color", "surface": "surface_color", "text": "text_color", "border": "border_color", "accent": "secondary_color"}.items():
        if field in changes.get("colors", {}):
            setattr(theme, attribute, changes["colors"][field])
    for field in ("font_family", "heading_weight", "body_weight"):
        if field in changes.get("typography", {}):
            setattr(theme, field, changes["typography"][field])
    for field, attribute in {"type": "background_type", "value": "background_value"}.items():
        if field in changes.get("background", {}):
            setattr(theme, attribute, changes["background"][field])
    if "radius" in changes.get("buttons", {}):
        theme.border_radius = changes["buttons"]["radius"]
    if "style" in changes.get("buttons", {}):
        theme.button_style = changes["buttons"]["style"]
    if "radius" in changes.get("inputs", {}):
        theme.input_radius = changes["inputs"]["radius"]
    await db.commit()
    await db.refresh(theme)
    return theme_data(theme)


async def reset_theme(db: AsyncSession, form_id: int) -> dict:
    theme = await _form_theme(db, form_id)
    for field, value in DEFAULT_THEME.items():
        setattr(theme, field, value)
    await db.commit()
    await db.refresh(theme)
    return theme_data(theme)
