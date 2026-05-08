from typing import Optional, List
from decimal import Decimal
from fastapi import HTTPException
from app.models.producto import Producto
from app.models.producto_categoria import ProductoCategoria
from app.models.producto_ingrediente import ProductoIngrediente
from app.repositories.producto_repository import ProductoRepository
from app.repositories.categoria_repository import CategoriaRepository
from app.repositories.ingrediente_repository import IngredienteRepository
from app.repositories.producto_categoria_repository import ProductoCategoriaRepository
from app.repositories.producto_ingrediente_repository import ProductoIngredienteRepository
from app.schemas.producto import ProductoRead
from app.uow import UnitOfWork


class ProductoService:
    def _to_read(self, producto: Producto) -> ProductoRead:
        return ProductoRead(
            id=producto.id,
            nombre=producto.nombre,
            descripcion=producto.descripcion,
            precio_base=producto.precio_base if isinstance(producto.precio_base, Decimal) else Decimal(str(producto.precio_base)),
            stock_cantidad=producto.stock_cantidad,
            disponible=producto.disponible,
        )

    def create(
        self,
        data: dict,
        categoria_id: Optional[int] = None,
    ) -> ProductoRead:
        with UnitOfWork() as uow:
            producto_repo = ProductoRepository(uow.session)
            producto = Producto(**data)
            producto_repo.add(producto)

            if categoria_id is not None:
                pc_repo = ProductoCategoriaRepository(uow.session)
                cat_repo = CategoriaRepository(uow.session)
                cat = cat_repo.get_by_id(categoria_id)
                if not cat:
                    raise HTTPException(
                        status_code=404,
                        detail=f"Categoria con id {categoria_id} no encontrada",
                    )
                pc = ProductoCategoria(
                    producto_id=producto.id,
                    categoria_id=categoria_id,
                    es_principal=True,
                )
                pc_repo.add(pc)

            uow.commit()
            uow.session.refresh(producto)
            return self._to_read(producto)

    def get_all(self) -> List[ProductoRead]:
        with UnitOfWork() as uow:
            repo = ProductoRepository(uow.session)
            items = repo.get_all()
            return [self._to_read(p) for p in items]

    def get_by_id(self, producto_id: int) -> ProductoRead:
        with UnitOfWork() as uow:
            repo = ProductoRepository(uow.session)
            producto = repo.get_by_id(producto_id)
            if not producto:
                raise HTTPException(
                    status_code=404, detail="Producto no encontrado"
                )
            return self._to_read(producto)

    def update(self, producto_id: int, data: dict) -> ProductoRead:
        with UnitOfWork() as uow:
            repo = ProductoRepository(uow.session)
            producto = repo.get_by_id(producto_id)
            if not producto:
                raise HTTPException(
                    status_code=404, detail="Producto no encontrado"
                )
            repo.update(producto, data)
            uow.commit()
            uow.session.refresh(producto)
            return self._to_read(producto)

    def delete(self, producto_id: int) -> None:
        with UnitOfWork() as uow:
            repo = ProductoRepository(uow.session)
            producto = repo.get_by_id(producto_id)
            if not producto:
                raise HTTPException(
                    status_code=404, detail="Producto no encontrado"
                )
            repo.delete(producto)
            uow.commit()

    def add_categoria(
        self, producto_id: int, categoria_id: int, es_principal: bool = False
    ) -> ProductoCategoria:
        with UnitOfWork() as uow:
            producto_repo = ProductoRepository(uow.session)
            producto = producto_repo.get_by_id(producto_id)
            if not producto:
                raise HTTPException(
                    status_code=404, detail="Producto no encontrado"
                )

            cat_repo = CategoriaRepository(uow.session)
            categoria = cat_repo.get_by_id(categoria_id)
            if not categoria:
                raise HTTPException(
                    status_code=404, detail="Categoria no encontrada"
                )

            pc_repo = ProductoCategoriaRepository(uow.session)
            existing = pc_repo.get_by_ids(producto_id, categoria_id)
            if existing:
                raise HTTPException(
                    status_code=400,
                    detail="El producto ya esta asignado a esta categoria",
                )

            pc = ProductoCategoria(
                producto_id=producto_id,
                categoria_id=categoria_id,
                es_principal=es_principal,
            )
            pc_repo.add(pc)
            uow.commit()
            return pc

    def remove_categoria(self, producto_id: int, categoria_id: int) -> None:
        with UnitOfWork() as uow:
            pc_repo = ProductoCategoriaRepository(uow.session)
            pc = pc_repo.get_by_ids(producto_id, categoria_id)
            if not pc:
                raise HTTPException(
                    status_code=404,
                    detail="Relacion producto-categoria no encontrada",
                )
            pc_repo.delete(pc)
            uow.commit()

    def add_ingrediente(
        self, producto_id: int, ingrediente_id: int, es_removible: bool = False
    ) -> ProductoIngrediente:
        with UnitOfWork() as uow:
            producto_repo = ProductoRepository(uow.session)
            producto = producto_repo.get_by_id(producto_id)
            if not producto:
                raise HTTPException(
                    status_code=404, detail="Producto no encontrado"
                )

            ing_repo = IngredienteRepository(uow.session)
            ingrediente = ing_repo.get_by_id(ingrediente_id)
            if not ingrediente:
                raise HTTPException(
                    status_code=404, detail="Ingrediente no encontrado"
                )

            pi_repo = ProductoIngredienteRepository(uow.session)
            existing = pi_repo.get_by_ids(producto_id, ingrediente_id)
            if existing:
                raise HTTPException(
                    status_code=400,
                    detail="El producto ya tiene este ingrediente",
                )

            pi = ProductoIngrediente(
                producto_id=producto_id,
                ingrediente_id=ingrediente_id,
                es_removible=es_removible,
            )
            pi_repo.add(pi)
            uow.commit()
            return pi

    def remove_ingrediente(self, producto_id: int, ingrediente_id: int) -> None:
        with UnitOfWork() as uow:
            pi_repo = ProductoIngredienteRepository(uow.session)
            pi = pi_repo.get_by_ids(producto_id, ingrediente_id)
            if not pi:
                raise HTTPException(
                    status_code=404,
                    detail="Relacion producto-ingrediente no encontrada",
                )
            pi_repo.delete(pi)
            uow.commit()

    def get_productos_by_categoria(self, categoria_id: int) -> List[ProductoRead]:
        with UnitOfWork() as uow:
            pc_repo = ProductoCategoriaRepository(uow.session)
            producto_repo = ProductoRepository(uow.session)
            pcs = pc_repo.get_by_categoria_id(categoria_id)
            productos = []
            for pc in pcs:
                producto = producto_repo.get_by_id(pc.producto_id)
                if producto:
                    productos.append(self._to_read(producto))
            return productos

    def get_principal_categoria_id(self, producto_id: int) -> Optional[int]:
        with UnitOfWork() as uow:
            pc_repo = ProductoCategoriaRepository(uow.session)
            pcs = pc_repo.get_by_producto_id(producto_id)
            for pc in pcs:
                if pc.es_principal:
                    return pc.categoria_id
            if pcs:
                return pcs[0].categoria_id
            return None

    def get_ingredientes_by_producto(self, producto_id: int):
        from app.models.ingrediente import Ingrediente
        with UnitOfWork() as uow:
            pi_repo = ProductoIngredienteRepository(uow.session)
            ing_repo = IngredienteRepository(uow.session)
            pis = pi_repo.get_by_producto_id(producto_id)
            ingredientes = []
            for pi in pis:
                ingrediente = ing_repo.get_by_id(pi.ingrediente_id)
                if ingrediente:
                    ingredientes.append(ingrediente)
            return ingredientes
