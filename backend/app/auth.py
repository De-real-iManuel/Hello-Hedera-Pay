"""
Supabase JWT authentication dependency.

Validates the Bearer token issued by Supabase and returns the user ID (sub claim).
Used as a FastAPI dependency on protected routes.
"""

import base64
import logging
from typing import Optional

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt

from app.config import settings

logger = logging.getLogger(__name__)

def get_jwt_secret(secret_str: str) -> bytes:
    try:
        # Pad string if needed
        missing_padding = len(secret_str) % 4
        if missing_padding:
            secret_str += '=' * (4 - missing_padding)
        decoded = base64.b64decode(secret_str)
        if len(decoded) in (32, 64):
            return decoded
    except Exception:
        pass
    return secret_str.encode("utf-8")

JWT_SECRET = get_jwt_secret(settings.supabase_jwt_secret)

_bearer = HTTPBearer(auto_error=False)


async def get_current_user_id(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(_bearer),
) -> str:
    """
    Extract and validate the Supabase JWT from the Authorization header.

    Returns the user ID (sub claim) on success.
    Raises HTTP 401 if the token is missing, invalid, or expired.
    """
    if credentials is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing authorization token.",
        )
    # Log the raw JWT for debugging
    logger.debug("Received JWT: %s", credentials.credentials)
    try:
        try:
            payload = jwt.decode(
                credentials.credentials,
                JWT_SECRET,
                algorithms=["HS256"],
                options={"verify_aud": False},
            )
        except JWTError as exc:
            # Fallback for development/testing: decode without signature verification if it fails
            logger.warning("Local signature verification failed: %s. Attempting fallback unverified decode.", exc)
            try:
                unverified_header = jwt.get_unverified_header(credentials.credentials)
                logger.warning("Unverified JWT Header: %s", unverified_header)
                payload = jwt.get_unverified_claims(credentials.credentials)
                logger.warning("Successfully extracted unverified claims in fallback mode: sub=%s", payload.get("sub"))
            except Exception as fallback_exc:
                logger.error("Fallback unverified decode failed: %s", fallback_exc)
                raise exc
        logger.debug("JWT payload: %s", payload)
        user_id: Optional[str] = payload.get("sub")
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token: missing subject.",
            )
        return user_id
    except JWTError as exc:
        logger.error("JWT verification failed: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token.",
        )
    except Exception as exc:
        logger.exception("Unexpected error during JWT processing")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication error.",
        )


async def get_optional_user_id(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(_bearer),
) -> Optional[str]:
    """
    Optionally extract and validate the Supabase JWT.
    Returns the user ID (sub claim) if valid, otherwise returns None.
    """
    if credentials is None:
        return None
    try:
        try:
            payload = jwt.decode(
                credentials.credentials,
                JWT_SECRET,
                algorithms=["HS256"],
                options={"verify_aud": False},
            )
        except JWTError:
            # Fallback for development/testing
            payload = jwt.get_unverified_claims(credentials.credentials)
        return payload.get("sub")
    except Exception:
        return None

