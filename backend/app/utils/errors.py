def sanitize_error(exc: Exception) -> str:
    """Return a safe error message with no internal details."""
    return "An internal error occurred. Please try again."
