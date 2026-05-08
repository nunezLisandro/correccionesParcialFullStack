from typing import Optional, Sequence
from sqlmodel import Session, select
from app.models.ingrediente import Ingrediente
from app.repositories.base import Repository


class IngredienteRepository(Repository[Ingrediente]):
    def __init__(self, session: Session):
        super().__init__(session, Ingrediente)

    def get_by_nombre(self, nombre: str) -> Optional[Ingrediente]:
        statement = select(Ingrediente).where(Ingrediente.nombre == nombre)
        return self.session.exec(statement).first()

    def search_by_nombre(self, nombre: str) -> Sequence[Ingrediente]:
        statement = select(Ingrediente).where(Ingrediente.nombre.contains(nombre))
        return self.session.exec(statement).all()

    def get_alergenos(self) -> Sequence[Ingrediente]:
        statement = select(Ingrediente).where(Ingrediente.es_alergeno == True)
        return self.session.exec(statement).all()
