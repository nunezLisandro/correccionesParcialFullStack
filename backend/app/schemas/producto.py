from pydantic import BaseModel, Field
from typing import Annotated, Optional
from decimal import Decimal


class ProductoBase(BaseModel):
    nombre: Annotated[
        str,
        Field(min_length=2, max_length=150, description="Nombre del producto"),
    ]
    descripcion: Annotated[
        Optional[str],
        Field(default=None, description="Descripcion del producto"),
    ]
    precio_base: Annotated[
        Decimal,
        Field(default=Decimal("0"), description="Precio base del producto"),
    ]
    stock_cantidad: Annotated[
        int,
        Field(default=0, description="Cantidad en stock"),
    ]
    disponible: Annotated[
        bool,
        Field(default=True, description="Indica si esta disponible"),
    ]


class ProductoCreate(ProductoBase):
    categoria_id: Annotated[
        Optional[int],
        Field(default=None, description="ID de la categoria principal"),
    ]


class ProductoRead(ProductoBase):
    id: int


class ProductoUpdate(BaseModel):
    nombre: Annotated[
        Optional[str],
        Field(min_length=2, max_length=150, description="Nombre del producto"),
    ] = None
    descripcion: Annotated[
        Optional[str],
        Field(default=None, description="Descripcion del producto"),
    ] = None
    precio_base: Annotated[
        Optional[Decimal],
        Field(default=None, description="Precio base del producto"),
    ] = None
    stock_cantidad: Annotated[
        Optional[int],
        Field(default=None, description="Cantidad en stock"),
    ] = None
    disponible: Annotated[
        Optional[bool],
        Field(default=None, description="Indica si esta disponible"),
    ] = None
