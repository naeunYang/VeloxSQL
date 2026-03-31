from pydantic_settings import BaseSettings # .env 파일 자동으로 읽어줌


class Settings(BaseSettings):
    groq_api_key: str
    groq_model: str = "llama-3.3-70b-versatile"
    groq_max_tokens: int = 4096
    cors_origins: str = "http://localhost:3000"
    env: str = "development"
    log_level: str = "INFO"

    @property
    def cors_origins_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",")]

    class Config:
        env_file = ".env"


settings = Settings()
