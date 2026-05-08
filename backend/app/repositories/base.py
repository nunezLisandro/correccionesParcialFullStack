from typing import Generic, TypeVar, Type, Optional, Sequence
from sqlmodel import Session, select, SQLModel

T = TypeVar("T", bound=SQLModel)


class Repository(Generic[T]):
    def __init__(self, session: Session, model: Type[T]):
        self.session = session
        self.model = model

    def get_by_id(self, id: int) -> Optional[T]:
        return self.session.get(self.model, id)

    def get_all(self) -> Sequence[T]:
        statement = select(self.model)
        return self.session.exec(statement).all()

    def add(self, entity: T) -> T:
        self.session.add(entity)
        self.session.flush()
        self.session.refresh(entity)
        return entity

    def delete(self, entity: T) -> None:
        self.session.delete(entity)

    def update(self, entity: T, update_data: dict) -> T:
        for key, value in update_data.items():
            if hasattr(entity, key):
                setattr(entity, key, value)
        self.session.add(entity)
        self.session.flush()
        self.session.refresh(entity)
        return entity
