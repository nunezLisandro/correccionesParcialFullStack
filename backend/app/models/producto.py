from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, TYPE_CHECKING
from decimal import Decimal

if TYPE_CHECKING:
    from app.models.producto_categoria import ProductoCategoria
    from app.models.producto_ingrediente import ProductoIngrediente


class ProductoBase(SQLModel):
    nombre: str = Field(max_length=150)
    descripcion: Optional[str] = Field(default=None)
    precio_base: Decimal = Field(default=Decimal("0"))
    stock_cantidad: int = Field(default=0)
    disponible: bool = Field(default=True)


class Producto(ProductoBase, table=True):
    __tablename__ = "producto"

    id: Optional[int] = Field(default=None, primary_key=True)

    categorias: list["ProductoCategoria"] = Relationship(
        back_populates="producto",
        sa_relationship_kwargs={"cascade": "all, delete-orphan"},
    )
    ingredientes: list["ProductoIngrediente"] = Relationship(
        back_populates="producto",
        sa_relationship_kwargs={"cascade": "all, delete-orphan"},
    )
