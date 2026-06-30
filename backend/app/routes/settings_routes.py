from fastapi import APIRouter

router = APIRouter(prefix="/api/settings", tags=["settings"])


@router.get("/")
async def get_settings():
    return {"Not": "Implemented"}


@router.post("/")
async def set_settings():
    return {"Not": "Implemented"}
