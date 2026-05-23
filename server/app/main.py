from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.auth.routes import router as auth_router
from app.routes.collaborations import router as collaborations_router
from app.routes.tasks import router as tasks_router
from app.routes.tenants import router as tenants_router
from app.routes.users import router as users_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    yield


app = FastAPI(
    title="SeedLandV API",
    version="0.1.0",
    description="批量视频生成订单服务（Seedance 2.0 via 火山方舟 Ark）",
    lifespan=lifespan,
)

# Electron 渲染进程通过 main process 代理调本地 API；CORS 仅为开发期 Web 客户端预留。
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(users_router)
app.include_router(tenants_router)
app.include_router(tasks_router)
app.include_router(collaborations_router)


@app.get("/healthz", tags=["meta"])
async def healthz() -> dict[str, str]:
    return {"status": "ok"}
