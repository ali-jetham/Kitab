from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from scalar_fastapi import get_scalar_api_reference
from sqlalchemy.exc import DatabaseError, IntegrityError

from app.core.config import settings
from app.db.database import init_db
from app.routes import (
    annotation_routes,
    bookmark_routes,
    document_routes,
    settings_routes,
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield


app = FastAPI(lifespan=lifespan)
app.mount("/static", StaticFiles(directory="static"), name="static")
app.frontend("/", directory="dist")

app.include_router(document_routes.router)
app.include_router(settings_routes.router)
app.include_router(annotation_routes.router)
app.include_router(bookmark_routes.router)


@app.exception_handler(DatabaseError)
async def database_error_exception_handler(request, exc):
    return JSONResponse(
        status_code=500,
        content={"message": "A database error occurred."},
    )


@app.exception_handler(IntegrityError)
async def integrity_error_exception_handler(request, exc):
    return JSONResponse(
        status_code=400,
        content={"message": "A database integrity error occurred."},
    )


if settings.ENVIRONMENT == "dev":
    app.add_middleware(
        CORSMiddleware,
        allow_origins="*",
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
        expose_headers=["*"],
    )


@app.get("/scalar", include_in_schema=False)
async def scalar_html():
    return get_scalar_api_reference(
        openapi_url=app.openapi_url,
    )
