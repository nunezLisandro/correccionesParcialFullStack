from fastapi import APIRouter, Query, Path
from typing import Annotated, Optional
from app.schemas.ingrediente import IngredienteCreate, IngredienteRead, IngredienteUpdate
from app.services.ingrediente_service import IngredienteService

router = APIRouter(prefix="/ingredientes", tags=["Ingredientes"])
service = IngredienteService()


@router.post("/", status_code=201, response_model=IngredienteRead)
def crear_ingrediente(ingrediente: IngredienteCreate):
    return service.create(ingrediente.model_dump())


@router.get("/", response_model=list[IngredienteRead])
def listar_ingredientes(
    nombre: Annotated[
        Optional[str],
        Query(description="Filtrar por nombre (busqueda parcial)"),
    ] = None,
):
    return service.get_all(nombre=nombre)


@router.get("/{ingrediente_id}", response_model=IngredienteRead)
def obtener_ingrediente(
    ingrediente_id: Annotated[int, Path(description="ID del ingrediente", gt=0)],
):
    return service.get_by_id(ingrediente_id)


@router.put("/{ingrediente_id}", response_model=IngredienteRead)
def actualizar_ingrediente(
    ingrediente_id: Annotated[int, Path(description="ID del ingrediente", gt=0)],
    ingrediente_data: IngredienteUpdate,
):
    data = ingrediente_data.model_dump(exclude_unset=True)
    return service.update(ingrediente_id, data)


@router.delete("/{ingrediente_id}")
def eliminar_ingrediente(
    ingrediente_id: Annotated[int, Path(description="ID del ingrediente", gt=0)],
):
    service.delete(ingrediente_id)
    return {"ok": True}
