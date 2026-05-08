from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, TYPE_CHECKING
from datetime import datetime

if TYPE_CHECKING:
    from app.models.producto_categoria import ProductoCategoria


class CategoriaBase(SQLModel):
    nombre: str = Field(max_length=100)
    descripcion: Optional[str] = Field(default=None)
    imagen_url: Optional[str] = Field(default=None)


class Categoria(CategoriaBase, table=True):
    __tablename__ = "categoria"

    id: Optional[int] = Field(default=None, primary_key=True)
    parent_id: Optional[int] = Field(
        default=None,
        foreign_key="categoria.id",
        nullable=True,
    )

    parent: Optional["Categoria"] = Relationship(
        back_populates="hijos",
        sa_relationship_kwargs=dict(
            remote_side="Categoria.id",
            foreign_keys="[Categoria.parent_id]",
        ),
    )
    hijos: list["Categoria"] = Relationship(
        back_populates="parent",
        sa_relationship_kwargs={"cascade": "all, delete-orphan"},
    )

    productos: list["ProductoCategoria"] = Relationship(
        back_populates="categoria",
        sa_relationship_kwargs={"cascade": "all, delete-orphan"},
    )
