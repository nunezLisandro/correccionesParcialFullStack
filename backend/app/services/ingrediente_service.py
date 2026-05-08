from typing import Optional, List
from fastapi import HTTPException
from app.models.ingrediente import Ingrediente
from app.repositories.ingrediente_repository import IngredienteRepository
from app.schemas.ingrediente import IngredienteRead
from app.uow import UnitOfWork


class IngredienteService:
    def _to_read(self, ingrediente: Ingrediente) -> IngredienteRead:
        return IngredienteRead(
            id=ingrediente.id,
            nombre=ingrediente.nombre,
            descripcion=ingrediente.descripcion,
            es_alergeno=ingrediente.es_alergeno,
        )

    def create(self, data: dict) -> IngredienteRead:
        with UnitOfWork() as uow:
            repo = IngredienteRepository(uow.session)
            if "nombre" in data:
                existing = repo.get_by_nombre(data["nombre"])
                if existing:
                    raise HTTPException(
                        status_code=400,
                        detail="Ya existe un ingrediente con ese nombre",
                    )
            ingrediente = Ingrediente(**data)
            repo.add(ingrediente)
            uow.commit()
            uow.session.refresh(ingrediente)
            return self._to_read(ingrediente)

    def get_all(self, nombre: Optional[str] = None) -> List[IngredienteRead]:
        with UnitOfWork() as uow:
            repo = IngredienteRepository(uow.session)
            if nombre:
                items = repo.search_by_nombre(nombre)
            else:
                items = repo.get_all()
            return [self._to_read(i) for i in items]

    def get_by_id(self, ingrediente_id: int) -> IngredienteRead:
        with UnitOfWork() as uow:
            repo = IngredienteRepository(uow.session)
            ingrediente = repo.get_by_id(ingrediente_id)
            if not ingrediente:
                raise HTTPException(
                    status_code=404, detail="Ingrediente no encontrado"
                )
            return self._to_read(ingrediente)

    def update(self, ingrediente_id: int, data: dict) -> IngredienteRead:
        with UnitOfWork() as uow:
            repo = IngredienteRepository(uow.session)
            ingrediente = repo.get_by_id(ingrediente_id)
            if not ingrediente:
                raise HTTPException(
                    status_code=404, detail="Ingrediente no encontrado"
                )
            if "nombre" in data and data["nombre"] != ingrediente.nombre:
                existing = repo.get_by_nombre(data["nombre"])
                if existing:
                    raise HTTPException(
                        status_code=400,
                        detail="Ya existe un ingrediente con ese nombre",
                    )
            repo.update(ingrediente, data)
            uow.commit()
            uow.session.refresh(ingrediente)
            return self._to_read(ingrediente)

    def delete(self, ingrediente_id: int) -> None:
        with UnitOfWork() as uow:
            repo = IngredienteRepository(uow.session)
            ingrediente = repo.get_by_id(ingrediente_id)
            if not ingrediente:
                raise HTTPException(
                    status_code=404, detail="Ingrediente no encontrado"
                )
            repo.delete(ingrediente)
            uow.commit()
