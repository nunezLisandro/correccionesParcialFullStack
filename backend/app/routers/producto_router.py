from fastapi import APIRouter, Path
from typing import Annotated
from app.schemas.producto import ProductoCreate, ProductoRead, ProductoUpdate
from app.schemas.categoria import CategoriaRead
from app.schemas.ingrediente import IngredienteRead
from app.services.producto_service import ProductoService

router = APIRouter(prefix="/productos", tags=["Productos"])
service = ProductoService()


@router.post("/", status_code=201, response_model=ProductoRead)
def crear_producto(producto: ProductoCreate):
    data = producto.model_dump(exclude={"categoria_id"})
    return service.create(
        data=data,
        categoria_id=producto.categoria_id,
    )


@router.get("/", response_model=list[ProductoRead])
def listar_productos():
    return service.get_all()


@router.get("/{producto_id}", response_model=ProductoRead)
def obtener_producto(
    producto_id: Annotated[int, Path(description="ID del producto", gt=0)],
):
    return service.get_by_id(producto_id)


@router.put("/{producto_id}", response_model=ProductoRead)
def actualizar_producto(
    producto_id: Annotated[int, Path(description="ID del producto", gt=0)],
    producto_data: ProductoUpdate,
):
    data = producto_data.model_dump(exclude_unset=True)
    return service.update(producto_id, data)


@router.delete("/{producto_id}")
def eliminar_producto(
    producto_id: Annotated[int, Path(description="ID del producto", gt=0)],
):
    service.delete(producto_id)
    return {"ok": True}


@router.get("/{producto_id}/categoria", response_model=CategoriaRead)
def obtener_categoria_principal(
    producto_id: Annotated[int, Path(description="ID del producto", gt=0)],
):
    categoria_id = service.get_principal_categoria_id(producto_id)
    if categoria_id is None:
        return {"mensaje": "Sin categoría asignada"}
    from app.services.categoria_service import CategoriaService
    cat_service = CategoriaService()
    return cat_service.get_by_id(categoria_id)


@router.get("/{producto_id}/ingredientes", response_model=list[IngredienteRead])
def obtener_ingredientes(
    producto_id: Annotated[int, Path(description="ID del producto", gt=0)],
):
    return service.get_ingredientes_by_producto(producto_id)
