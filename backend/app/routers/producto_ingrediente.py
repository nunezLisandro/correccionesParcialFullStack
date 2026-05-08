from fastapi import APIRouter, Path
from typing import Annotated
from app.schemas.ingrediente import IngredienteRead
from app.services.producto_service import ProductoService

router = APIRouter(prefix="/producto-ingrediente", tags=["Producto-Ingrediente"])
producto_service = ProductoService()


@router.post("/producto/{producto_id}/ingrediente/{ingrediente_id}", response_model=dict)
def asignar_ingrediente_a_producto(
    producto_id: Annotated[int, Path(description="ID del producto", gt=0)],
    ingrediente_id: Annotated[int, Path(description="ID del ingrediente", gt=0)],
    es_removible: bool = False,
):
    pi = producto_service.add_ingrediente(producto_id, ingrediente_id, es_removible)
    return {
        "producto_id": pi.producto_id,
        "ingrediente_id": pi.ingrediente_id,
        "es_removible": pi.es_removible,
    }


@router.delete("/producto/{producto_id}/ingrediente/{ingrediente_id}")
def remover_ingrediente_de_producto(
    producto_id: Annotated[int, Path(description="ID del producto", gt=0)],
    ingrediente_id: Annotated[int, Path(description="ID del ingrediente", gt=0)],
):
    producto_service.remove_ingrediente(producto_id, ingrediente_id)
    return {"mensaje": "Relacion eliminada"}
