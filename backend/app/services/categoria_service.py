from typing import Optional, Sequence, List
from fastapi import HTTPException
from app.models.categoria import Categoria
from app.repositories.categoria_repository import CategoriaRepository
from app.schemas.categoria import CategoriaRead
from app.uow import UnitOfWork


class CategoriaService:
    def _to_read(self, categoria: Categoria) -> CategoriaRead:
        return CategoriaRead(
            id=categoria.id,
            nombre=categoria.nombre,
            descripcion=categoria.descripcion,
            imagen_url=categoria.imagen_url,
            parent_id=categoria.parent_id,
            hijos=[self._to_read(h) for h in categoria.hijos] if categoria.hijos else [],
        )

    def create(self, data: dict) -> CategoriaRead:
        with UnitOfWork() as uow:
            repo = CategoriaRepository(uow.session)
            if "nombre" in data:
                existing = repo.get_by_nombre(data["nombre"])
                if existing:
                    raise HTTPException(
                        status_code=400,
                        detail="Ya existe una categoria con ese nombre",
                    )
            categoria = Categoria(**data)
            repo.add(categoria)
            uow.commit()
            uow.session.refresh(categoria)
            return self._to_read(categoria)

    def get_all(self, nombre: Optional[str] = None) -> List[CategoriaRead]:
        with UnitOfWork() as uow:
            repo = CategoriaRepository(uow.session)
            if nombre:
                items = repo.search_by_nombre(nombre)
            else:
                items = repo.get_all()
            return [self._to_read(c) for c in items]

    def get_by_id(self, categoria_id: int) -> CategoriaRead:
        with UnitOfWork() as uow:
            repo = CategoriaRepository(uow.session)
            categoria = repo.get_by_id(categoria_id)
            if not categoria:
                raise HTTPException(
                    status_code=404, detail="Categoria no encontrada"
                )
            return self._to_read(categoria)

    def update(self, categoria_id: int, data: dict) -> CategoriaRead:
        with UnitOfWork() as uow:
            repo = CategoriaRepository(uow.session)
            categoria = repo.get_by_id(categoria_id)
            if not categoria:
                raise HTTPException(
                    status_code=404, detail="Categoria no encontrada"
                )
            if "nombre" in data and data["nombre"] != categoria.nombre:
                existing = repo.get_by_nombre(data["nombre"])
                if existing:
                    raise HTTPException(
                        status_code=400,
                        detail="Ya existe una categoria con ese nombre",
                    )
            repo.update(categoria, data)
            uow.commit()
            uow.session.refresh(categoria)
            return self._to_read(categoria)

    def delete(self, categoria_id: int) -> None:
        with UnitOfWork() as uow:
            repo = CategoriaRepository(uow.session)
            categoria = repo.get_by_id(categoria_id)
            if not categoria:
                raise HTTPException(
                    status_code=404, detail="Categoria no encontrada"
                )
            repo.delete(categoria)
            uow.commit()
