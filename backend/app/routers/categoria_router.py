from fastapi import APIRouter, Query, Path
from typing import Annotated, Optional
from app.schemas.categoria import CategoriaCreate, CategoriaRead, CategoriaUpdate
from app.services.categoria_service import CategoriaService

router = APIRouter(prefix="/categorias", tags=["Categorias"])
service = CategoriaService()


@router.post("/", status_code=201, response_model=CategoriaRead)
def crear_categoria(categoria: CategoriaCreate):
    return service.create(categoria.model_dump())


@router.get("/", response_model=list[CategoriaRead])
def listar_categorias(
    nombre: Annotated[
        Optional[str],
        Query(description="Filtrar por nombre (busqueda parcial)"),
    ] = None,
):
    return service.get_all(nombre=nombre)


@router.get("/{categoria_id}", response_model=CategoriaRead)
def obtener_categoria(
    categoria_id: Annotated[int, Path(description="ID de la categoria", gt=0)],
):
    return service.get_by_id(categoria_id)


@router.put("/{categoria_id}", response_model=CategoriaRead)
def actualizar_categoria(
    categoria_id: Annotated[int, Path(description="ID de la categoria", gt=0)],
    categoria_data: CategoriaUpdate,
):
    data = categoria_data.model_dump(exclude_unset=True)
    return service.update(categoria_id, data)


@router.delete("/{categoria_id}")
def eliminar_categoria(
    categoria_id: Annotated[int, Path(description="ID de la categoria", gt=0)],
):
    service.delete(categoria_id)
    return {"mensaje": "Eliminada"}
