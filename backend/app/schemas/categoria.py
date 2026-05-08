from pydantic import BaseModel, Field
from typing import Annotated, Optional


class CategoriaBase(BaseModel):
    nombre: Annotated[
        str,
        Field(min_length=2, max_length=100, description="Nombre de la categoria"),
    ]
    descripcion: Annotated[
        Optional[str],
        Field(default=None, description="Descripcion de la categoria"),
    ]
    imagen_url: Annotated[
        Optional[str],
        Field(default=None, description="URL de la imagen de la categoria"),
    ]
    parent_id: Annotated[
        Optional[int],
        Field(default=None, description="ID de la categoria padre"),
    ]


class CategoriaCreate(CategoriaBase):
    pass


class CategoriaRead(CategoriaBase):
    id: int
    hijos: list["CategoriaRead"] = []


class CategoriaUpdate(BaseModel):
    nombre: Annotated[
        Optional[str],
        Field(min_length=2, max_length=100, description="Nombre de la categoria"),
    ] = None
    descripcion: Annotated[
        Optional[str],
        Field(default=None, description="Descripcion de la categoria"),
    ] = None
    imagen_url: Annotated[
        Optional[str],
        Field(default=None, description="URL de la imagen de la categoria"),
    ] = None
    parent_id: Annotated[
        Optional[int],
        Field(default=None, description="ID de la categoria padre"),
    ] = None
