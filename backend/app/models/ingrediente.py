from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, TYPE_CHECKING

if TYPE_CHECKING:
    from app.models.producto_ingrediente import ProductoIngrediente


class IngredienteBase(SQLModel):
    nombre: str = Field(max_length=100)
    descripcion: Optional[str] = Field(default=None)
    es_alergeno: bool = Field(default=False)


class Ingrediente(IngredienteBase, table=True):
    __tablename__ = "ingrediente"

    id: Optional[int] = Field(default=None, primary_key=True)

    productos: list["ProductoIngrediente"] = Relationship(
        back_populates="ingrediente",
        sa_relationship_kwargs={"cascade": "all, delete-orphan"},
    )
