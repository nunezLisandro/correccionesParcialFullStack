from typing import Sequence
from sqlmodel import Session, select
from app.models.producto import Producto
from app.repositories.base import Repository


class ProductoRepository(Repository[Producto]):
    def __init__(self, session: Session):
        super().__init__(session, Producto)

    def get_disponibles(self) -> Sequence[Producto]:
        statement = select(Producto).where(Producto.disponible == True)
        return self.session.exec(statement).all()

    def search_by_nombre(self, nombre: str) -> Sequence[Producto]:
        statement = select(Producto).where(Producto.nombre.contains(nombre))
        return self.session.exec(statement).all()
