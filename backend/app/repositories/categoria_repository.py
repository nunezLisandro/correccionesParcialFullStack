from typing import Optional, Sequence
from sqlmodel import Session, select
from app.models.categoria import Categoria
from app.repositories.base import Repository


class CategoriaRepository(Repository[Categoria]):
    def __init__(self, session: Session):
        super().__init__(session, Categoria)

    def get_by_nombre(self, nombre: str) -> Optional[Categoria]:
        statement = select(Categoria).where(Categoria.nombre == nombre)
        return self.session.exec(statement).first()

    def search_by_nombre(self, nombre: str) -> Sequence[Categoria]:
        statement = select(Categoria).where(Categoria.nombre.contains(nombre))
        return self.session.exec(statement).all()

    def get_root_categories(self) -> Sequence[Categoria]:
        statement = select(Categoria).where(Categoria.parent_id.is_(None))
        return self.session.exec(statement).all()

    def get_children(self, parent_id: int) -> Sequence[Categoria]:
        statement = select(Categoria).where(Categoria.parent_id == parent_id)
        return self.session.exec(statement).all()
