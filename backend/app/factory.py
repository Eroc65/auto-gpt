from __future__ import annotations

import importlib
import importlib.util
from contextlib import asynccontextmanager

from fastapi import FastAPI

from .settings import load_settings


def register_routers(app: FastAPI) -> None:
    """
    Keep router imports here, not in app.main.
    """
    spec = importlib.util.find_spec("app.api")
    if spec is None:
        return

    api_module = importlib.import_module("app.api")
    router = getattr(api_module, "router", None)
    if router is not None:
        app.include_router(router)


def create_app(*, testing: bool = False) -> FastAPI:
    settings = load_settings(testing=testing)

    @asynccontextmanager
    async def lifespan(app: FastAPI):
        if not getattr(app.state, "routers_registered", False):
            register_routers(app)
            app.state.routers_registered = True

        shutdown_service_fn = None
        if settings.enable_startup_side_effects:
            # Defer startup module import so `import app.main` stays fast and side-effect free.
            from .startup import startup_services as _startup_services
            from .startup import shutdown_services as _shutdown_services

            shutdown_service_fn = _shutdown_services
            await _startup_services(app)
        try:
            yield
        finally:
            if settings.enable_startup_side_effects:
                assert shutdown_service_fn is not None
                await shutdown_service_fn(app)

    app = FastAPI(lifespan=lifespan)
    app.state.settings = settings
    app.state.routers_registered = False

    @app.get("/")
    def read_root():
        return {"message": "FrontDesk Pro API is running"}

    return app
