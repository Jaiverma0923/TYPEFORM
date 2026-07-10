class APIError(Exception):
    """Base application exception with a contract-compliant error payload."""

    def __init__(self, message: str, status_code: int = 400, errors: list[dict] | None = None):
        super().__init__(message)
        self.message = message
        self.status_code = status_code
        self.errors = errors if errors is not None else []


class NotFoundError(APIError):
    """Raised when an application resource cannot be found."""

    def __init__(self, message: str = "Resource not found", errors: list[dict] | None = None):
        super().__init__(message=message, status_code=404, errors=errors)


class BusinessValidationError(APIError):
    """Raised when an application-level validation rule is not met."""

    def __init__(self, message: str = "Validation failed", errors: list[dict] | None = None):
        super().__init__(message=message, status_code=422, errors=errors)


class ConflictError(APIError):
    def __init__(self, message: str, errors: list[dict] | None = None):
        super().__init__(message=message, status_code=409, errors=errors)
