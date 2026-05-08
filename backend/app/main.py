from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import create_db_and_tables
from app.routers.categoria_router import router as categoria_router
from app.routers.producto_router import router as producto_router
from app.routers.ingrediente_router import router as ingrediente_router
from app.routers.producto_categoria import router as producto_categoria_router
from app.routers.producto_ingrediente import router as producto_ingrediente_router
from sqlmodel import SQLModel

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(categoria_router)
app.include_router(producto_router)
app.include_router(ingrediente_router)
app.include_router(producto_categoria_router)
app.include_router(producto_ingrediente_router)


@app.on_event("startup")
def on_startup():
    create_db_and_tables()


@app.get("/")
def root():
    return {"mensaje": "API funcionando"}


@app.post("/debug/reset-tables")
def reset_tables():
    from app.database import engine
    SQLModel.metadata.drop_all(engine)
    SQLModel.metadata.create_all(engine)
    return {"mensaje": "Tablas recreadas"}
