from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.routers import auth, search, resources, bundles, chat, settings as user_settings, health


def create_app() -> FastAPI:
    app = FastAPI(
        title="StudyBridge AI Backend",
        version="1.0.0",
        openapi_url="/docs/openapi.json",
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=True,
        allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allow_headers=["Content-Type", "Authorization", "X-Provider", "X-Request-ID"],
        max_age=86400,
    )

    app.include_router(health.router, prefix="/api/v1")
    app.include_router(auth.router, prefix="/api/v1")
    app.include_router(search.router, prefix="/api/v1")
    app.include_router(resources.router, prefix="/api/v1")
    app.include_router(bundles.router, prefix="/api/v1")
    app.include_router(chat.router, prefix="/api/v1")
    app.include_router(user_settings.router, prefix="/api/v1")

    return app


app = create_app()

