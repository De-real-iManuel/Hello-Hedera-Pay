import re
import sys
from typing import Literal

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    # AI
    openrouter_api_key: str
    openrouter_model: str
    tavily_api_key: str

    # Hedera
    hedera_account_id: str
    hedera_private_key: str
    hedera_network: Literal["testnet", "mainnet"]
    hcs_topic_id: str

    # Supabase
    supabase_url: str
    supabase_anon_key: str
    supabase_service_role_key: str
    supabase_jwt_secret: str

    # Server
    allowed_origins: str = "http://localhost:4028"
    port: int = 8000

    @property
    def allowed_origins_list(self) -> list[str]:
        return [o.strip() for o in self.allowed_origins.split(",") if o.strip()]

    @field_validator("hedera_account_id", "hcs_topic_id")
    @classmethod
    def validate_hedera_id(cls, v: str) -> str:
        if not re.match(r"^0\.0\.\d+$", v.strip()):
            raise ValueError(f"Must be in format 0.0.<number>, got: {v}")
        return v.strip()


try:
    settings = Settings()
except Exception as exc:
    print(f"[config] Missing or invalid environment variable: {exc}", file=sys.stderr)
    sys.exit(1)
