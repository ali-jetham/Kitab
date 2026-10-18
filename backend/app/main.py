from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy.exc import DatabaseError, IntegrityError, NoResultFound

from app.core.config import settings
from app.db.database import init_db
from app.routes import (
    annotation_routes,
    bookmark_routes,
    document_routes,
    settings_routes,
    tts_routes,
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield


app = FastAPI(lifespan=lifespan)
app.frontend("/", directory="dist")

app.include_router(document_routes.router)
app.include_router(settings_routes.router)
app.include_router(annotation_routes.router)
app.include_router(bookmark_routes.router)
app.include_router(tts_routes.router)


@app.exception_handler(DatabaseError)
async def database_error_handler(request, exc):
    return JSONResponse(
        status_code=500,
        content={"message": "A database error occurred."},
    )


@app.exception_handler(NoResultFound)
async def no_result_found_handler(request, exc):
    route = request.scope.get("route")
    resource = route.tags[0] if route and route.tags else "resource"
    return JSONResponse(
        status_code=404, content={"detail": f"No {resource[0:-1]} found"}
    )


@app.exception_handler(IntegrityError)
async def integrity_error_handler(request, exc):
    return JSONResponse(
        status_code=400,
        content={"message": "A database integrity error occurred."},
    )

@app.exception_handler(FileNotFoundError)
async def file_not_found_error_handler(request, exc):
    return JSONResponse(
        status_code=404,
        content={"message": "File not found"}
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
    from scalar_fastapi import get_scalar_api_reference

    @app.get("/scalar", include_in_schema=False)
    async def scalar_html():
        return get_scalar_api_reference(
            openapi_url=app.openapi_url,
        )
