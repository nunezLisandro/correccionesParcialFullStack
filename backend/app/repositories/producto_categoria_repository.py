from typing import Optional, Sequence
from sqlmodel import Session, select
from app.models.producto_categoria import ProductoCategoria
from app.repositories.base import Repository


class ProductoCategoriaRepository(Repository[ProductoCategoria]):
    def __init__(self, session: Session):
        super().__init__(session, ProductoCategoria)

    def get_by_producto_id(self, producto_id: int) -> Sequence[ProductoCategoria]:
        statement = select(ProductoCategoria).where(
            ProductoCategoria.producto_id == producto_id
        )
        return self.session.exec(statement).all()

    def get_by_categoria_id(self, categoria_id: int) -> Sequence[ProductoCategoria]:
        statement = select(ProductoCategoria).where(
            ProductoCategoria.categoria_id == categoria_id
        )
        return self.session.exec(statement).all()

    def get_by_ids(
        self, producto_id: int, categoria_id: int
    ) -> Optional[ProductoCategoria]:
        statement = select(ProductoCategoria).where(
            ProductoCategoria.producto_id == producto_id,
            ProductoCategoria.categoria_id == categoria_id,
        )
        return self.session.exec(statement).first()

    def delete_by_producto_id(self, producto_id: int) -> None:
        relaciones = self.get_by_producto_id(producto_id)
        for relacion in relaciones:
            self.session.delete(relacion)

    def delete_by_categoria_id(self, categoria_id: int) -> None:
        relaciones = self.get_by_categoria_id(categoria_id)
        for relacion in relaciones:
            self.session.delete(relacion)
