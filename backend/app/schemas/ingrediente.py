from pydantic import BaseModel, Field
from typing import Annotated, Optional


class IngredienteBase(BaseModel):
    nombre: Annotated[
        str,
        Field(min_length=2, max_length=100, description="Nombre del ingrediente"),
    ]
    descripcion: Annotated[
        Optional[str],
        Field(default=None, description="Descripcion del ingrediente"),
    ]
    es_alergeno: Annotated[
        bool,
        Field(default=False, description="Indica si es alergeno"),
    ]


class IngredienteCreate(IngredienteBase):
    pass


class IngredienteRead(IngredienteBase):
    id: int


class IngredienteUpdate(BaseModel):
    nombre: Annotated[
        Optional[str],
        Field(min_length=2, max_length=100, description="Nombre del ingrediente"),
    ] = None
    descripcion: Annotated[
        Optional[str],
        Field(default=None, description="Descripcion del ingrediente"),
    ] = None
    es_alergeno: Annotated[
        Optional[bool],
        Field(default=None, description="Indica si es alergeno"),
    ] = None
