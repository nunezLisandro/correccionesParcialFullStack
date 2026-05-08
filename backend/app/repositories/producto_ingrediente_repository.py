from typing import Optional, Sequence
from sqlmodel import Session, select
from app.models.producto_ingrediente import ProductoIngrediente
from app.repositories.base import Repository


class ProductoIngredienteRepository(Repository[ProductoIngrediente]):
    def __init__(self, session: Session):
        super().__init__(session, ProductoIngrediente)

    def get_by_producto_id(self, producto_id: int) -> Sequence[ProductoIngrediente]:
        statement = select(ProductoIngrediente).where(
            ProductoIngrediente.producto_id == producto_id
        )
        return self.session.exec(statement).all()

    def get_by_ingrediente_id(
        self, ingrediente_id: int
    ) -> Sequence[ProductoIngrediente]:
        statement = select(ProductoIngrediente).where(
            ProductoIngrediente.ingrediente_id == ingrediente_id
        )
        return self.session.exec(statement).all()

    def get_by_ids(
        self, producto_id: int, ingrediente_id: int
    ) -> Optional[ProductoIngrediente]:
        statement = select(ProductoIngrediente).where(
            ProductoIngrediente.producto_id == producto_id,
            ProductoIngrediente.ingrediente_id == ingrediente_id,
        )
        return self.session.exec(statement).first()

    def delete_by_producto_id(self, producto_id: int) -> None:
        relaciones = self.get_by_producto_id(producto_id)
        for relacion in relaciones:
            self.session.delete(relacion)
