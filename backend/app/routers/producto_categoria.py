from fastapi import APIRouter, Path
from typing import Annotated
from app.schemas.producto import ProductoRead
from app.schemas.categoria import CategoriaRead
from app.services.producto_service import ProductoService
from app.services.categoria_service import CategoriaService

router = APIRouter(prefix="/producto-categoria", tags=["Producto-Categoria"])
producto_service = ProductoService()
categoria_service = CategoriaService()


@router.get("/categoria/{categoria_id}/productos", response_model=list[ProductoRead])
def listar_productos_por_categoria(
    categoria_id: Annotated[int, Path(description="ID de la categoria", gt=0)],
):
    categoria_service.get_by_id(categoria_id)
    return producto_service.get_productos_by_categoria(categoria_id)


@router.put("/producto/{producto_id}/categoria/{categoria_id}", response_model=dict)
def asignar_categoria_a_producto(
    producto_id: Annotated[int, Path(description="ID del producto", gt=0)],
    categoria_id: Annotated[int, Path(description="ID de la categoria", gt=0)],
):
    pc = producto_service.add_categoria(producto_id, categoria_id)
    return {
        "producto_id": pc.producto_id,
        "categoria_id": pc.categoria_id,
        "es_principal": pc.es_principal,
    }


@router.delete("/producto/{producto_id}/categoria/{categoria_id}")
def remover_categoria_de_producto(
    producto_id: Annotated[int, Path(description="ID del producto", gt=0)],
    categoria_id: Annotated[int, Path(description="ID de la categoria", gt=0)],
):
    producto_service.remove_categoria(producto_id, categoria_id)
    return {"mensaje": "Relacion eliminada"}
