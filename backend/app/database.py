from sqlmodel import SQLModel, create_engine
from sqlalchemy import text

from app.models.categoria import Categoria
from app.models.producto import Producto
from app.models.ingrediente import Ingrediente
from app.models.producto_categoria import ProductoCategoria
from app.models.producto_ingrediente import ProductoIngrediente

DATABASE_URL = "postgresql://postgres:lichi123@localhost:5432/parcialProg4"

engine = create_engine(DATABASE_URL, echo=False)


def create_db_and_tables():
    SQLModel.metadata.create_all(engine)
