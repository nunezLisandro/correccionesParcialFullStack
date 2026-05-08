from sqlmodel import Session
from app.database import engine


class UnitOfWork:
    def __init__(self):
        self.session = Session(engine)

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        if exc_type is not None:
            try:
                self.session.rollback()
            except Exception:
                pass
        self.session.close()

    def commit(self):
        self.session.commit()

    def rollback(self):
        try:
            self.session.rollback()
        except Exception:
            pass
