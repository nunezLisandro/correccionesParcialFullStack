import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { productoApi, categoriaApi, ingredienteApi, productoIngredienteApi } from "../api";
import type { Producto, Categoria, Ingrediente } from "../types";
import { FormModal } from "../components/Modal";

export default function ProductosPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editData, setEditData] = useState<Producto | null>(null);
  const [formData, setFormData] = useState({ nombre: "", precio_base: 0, stock_cantidad: 0, disponible: true, categoria_id: null as number | null });
  const [selectedParentId, setSelectedParentId] = useState<number | null>(null);

  const { data: productos, error: productosError, isFetching: productosFetching } = useQuery({
    queryKey: ["productos"],
    queryFn: () => productoApi.getAll().then((res) => res.data),
  });

  const { data: categorias } = useQuery({
    queryKey: ["categorias"],
    queryFn: () => categoriaApi.getAll().then((res) => res.data),
  });

  const { data: todosIngredientes } = useQuery({
    queryKey: ["ingredientes"],
    queryFn: () => ingredienteApi.getAll().then((res) => res.data),
  });

  const categoriasPadre = (categorias ?? []).filter((c: Categoria) => !c.parent_id);
  const subcategorias = selectedParentId
    ? (categorias ?? []).filter((c: Categoria) => c.parent_id === selectedParentId)
    : [];

  const createMutation = useMutation({
    mutationFn: (data: { nombre: string; precio_base: number; stock_cantidad: number; disponible: boolean; categoria_id: number | null }) => {
      const payload: { nombre: string; precio_base?: number; stock_cantidad?: number; disponible?: boolean; categoria_id?: number } = {
        nombre: data.nombre,
        precio_base: data.precio_base,
        stock_cantidad: data.stock_cantidad,
        disponible: data.disponible,
      };
      if (data.categoria_id != null) payload.categoria_id = data.categoria_id;
      return productoApi.create(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["productos"] });
      closeModal();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: { nombre: string; precio_base: number; stock_cantidad: number; disponible: boolean } }) =>
      productoApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["productos"] });
      closeModal();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => productoApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["productos"] });
    },
  });

  const openModal = (producto?: Producto) => {
    if (producto) {
      setEditData(producto);
      setFormData({ nombre: producto.nombre, precio_base: producto.precio_base, stock_cantidad: producto.stock_cantidad, disponible: producto.disponible, categoria_id: null });
    } else {
      setEditData(null);
      setFormData({ nombre: "", precio_base: 0, stock_cantidad: 0, disponible: true, categoria_id: null });
    }
    setSelectedParentId(null);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditData(null);
    setFormData({ nombre: "", precio_base: 0, stock_cantidad: 0, disponible: true, categoria_id: null });
    setSelectedParentId(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editData?.id) {
      updateMutation.mutate({ id: editData.id, data: { nombre: formData.nombre, precio_base: formData.precio_base, stock_cantidad: formData.stock_cantidad, disponible: formData.disponible } });
    } else {
      createMutation.mutate(formData);
    }
  };

  if (productosError) return (
    <div className="p-8 max-w-4xl mx-auto text-center">
      <p className="text-red-600 text-lg font-semibold mb-2">Error al cargar los productos</p>
      <p className="text-gray-500 text-sm mb-4">Verificá que el backend esté corriendo en http://localhost:8000</p>
      <button
        onClick={() => window.location.reload()}
        className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
      >
        Reintentar
      </button>
    </div>
  );

  if (productosFetching && !productos) return <div className="p-8 text-center text-gray-500">Cargando...</div>;

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <span className="w-3 h-3 rounded-full bg-blue-500"></span>
          <h1 className="text-3xl font-bold text-gray-800">Productos</h1>
        </div>
        <p className="text-gray-500 ml-6">Gestiona los productos de tu menu</p>
      </div>

      <button
        onClick={() => openModal()}
        className="mb-6 bg-blue-600 text-white px-5 py-2.5 rounded-xl hover:bg-blue-700 transition-colors font-medium shadow-lg shadow-blue-500/30 flex items-center gap-2"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        Nuevo Producto
      </button>

      {productos?.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-dashed border-gray-300">
          <p className="text-gray-500">No hay productos creados</p>
          <p className="text-gray-400 text-sm mt-1">Crea tu primer producto para comenzar</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {productos?.map((prod: Producto) => (
            <ProductoCard
              key={prod.id}
              producto={prod}
              todosIngredientes={todosIngredientes ?? []}
              onEdit={openModal}
              onDelete={(id) => {
                if (confirm("¿Eliminar este producto?")) deleteMutation.mutate(id);
              }}
              onViewDetail={(id) => navigate(`/productos/${id}`)}
            />
          ))}
        </div>
      )}

      <FormModal
        isOpen={modalOpen}
        onClose={closeModal}
        title={editData ? "Editar Producto" : "Nuevo Producto"}
        onSubmit={handleSubmit}
      >
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Nombre</label>
          <input
            type="text"
            value={formData.nombre}
            onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
            className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 focus:border-blue-500 focus:outline-none transition-colors"
            placeholder="Ej: Hamburguesa Classic..."
            required
            autoFocus
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Precio</label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={formData.precio_base}
            onChange={(e) => setFormData({ ...formData, precio_base: parseFloat(e.target.value) || 0 })}
            className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 focus:border-blue-500 focus:outline-none transition-colors"
            placeholder="0.00"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Stock</label>
          <input
            type="number"
            min="0"
            value={formData.stock_cantidad}
            onChange={(e) => setFormData({ ...formData, stock_cantidad: parseInt(e.target.value) || 0 })}
            className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 focus:border-blue-500 focus:outline-none transition-colors"
            placeholder="0"
          />
        </div>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="disponible"
            checked={formData.disponible}
            onChange={(e) => setFormData({ ...formData, disponible: e.target.checked })}
            className="w-4 h-4 text-blue-600 border-2 border-gray-200 rounded focus:ring-blue-500"
          />
          <label htmlFor="disponible" className="text-sm font-medium text-gray-700">Disponible</label>
        </div>
        {!editData && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Categoría</label>
              <select
                value={selectedParentId ?? ""}
                onChange={(e) => {
                  const pid = e.target.value ? Number(e.target.value) : null;
                  setSelectedParentId(pid);
                  setFormData({ ...formData, categoria_id: null });
                }}
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 focus:border-blue-500 focus:outline-none transition-colors bg-white"
              >
                <option value="">Seleccionar categoría...</option>
                {categoriasPadre.map((cat: Categoria) => (
                  <option key={cat.id} value={cat.id}>{cat.nombre}</option>
                ))}
              </select>
            </div>
            {selectedParentId && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Subcategoría</label>
                <select
                  value={formData.categoria_id ?? ""}
                  onChange={(e) => setFormData({ ...formData, categoria_id: e.target.value ? Number(e.target.value) : null })}
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 focus:border-blue-500 focus:outline-none transition-colors bg-white"
                  required
                >
                  <option value="">Seleccionar subcategoría...</option>
                  {subcategorias.map((cat: Categoria) => (
                    <option key={cat.id} value={cat.id}>{cat.nombre}</option>
                  ))}
                </select>
              </div>
            )}
          </>
        )}
      </FormModal>
    </div>
  );
}

function ProductoCard({
  producto,
  todosIngredientes,
  onEdit,
  onDelete,
  onViewDetail,
}: {
  producto: Producto;
  todosIngredientes: Ingrediente[];
  onEdit: (producto: Producto) => void;
  onDelete: (id: number) => void;
  onViewDetail: (id: number) => void;
}) {
  const queryClient = useQueryClient();
  const [showIngSelect, setShowIngSelect] = useState(false);
  const [selectedIng, setSelectedIng] = useState<number | null>(null);

  const { data: categoria } = useQuery({
    queryKey: ["producto-categoria", producto.id],
    queryFn: () => productoApi.getCategoria(producto.id!).then((res) => res.data),
  });

  const { data: ingredientes } = useQuery({
    queryKey: ["producto-ingredientes", producto.id],
    queryFn: () => productoApi.getIngredientes(producto.id!).then((res) => res.data),
  });

  const addIngMutation = useMutation({
    mutationFn: (ingId: number) => {
      if (!producto.id) return Promise.reject(new Error("ID de producto inválido"));
      return productoIngredienteApi.asignarIngrediente(producto.id, ingId, false);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["producto-ingredientes", producto.id] });
      setShowIngSelect(false);
      setSelectedIng(null);
    },
    onError: (err: unknown) => {
      const e = err as { response?: { data?: { detail?: string } }; message?: string };
      alert("Error al agregar ingrediente: " + (e.response?.data?.detail || e.message || "Error desconocido"));
    },
  });

  const removeIngMutation = useMutation({
    mutationFn: (ingId: number) => productoIngredienteApi.removerIngrediente(producto.id!, ingId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["producto-ingredientes", producto.id] });
    },
  });

  const ingredienteIds = ingredientes?.map((i) => i.id) ?? [];
  const ingredientesDisponibles = todosIngredientes.filter((i) => !ingredienteIds.includes(i.id));

  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 p-5 border border-gray-100">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-lg font-semibold text-gray-800">{producto.nombre}</h3>
            <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
              producto.disponible
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}>
              {producto.disponible ? "Disponible" : "No disponible"}
            </span>
          </div>
          <span className="inline-block px-2 py-0.5 text-sm font-bold text-green-600">
            ${producto.precio_base}
          </span>
          {categoria?.nombre && (
            <span className="ml-2 inline-block px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">
              {categoria.nombre}
            </span>
          )}
          {ingredientes && ingredientes.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {ingredientes.map((ing: Ingrediente) => (
                <span
                  key={ing.id}
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                    ing.es_alergeno ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"
                  }`}
                >
                  {ing.nombre}
                  <button
                    onClick={() => removeIngMutation.mutate(ing.id!)}
                    className="ml-0.5 text-red-500 hover:text-red-700"
                    title="Quitar"
                  >
                    &times;
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
        <div className="flex flex-col gap-1 ml-4">
          <button
            onClick={() => onViewDetail(producto.id!)}
            className="px-3 py-1.5 text-sm bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            Ver detalle
          </button>
          <button
            onClick={() => onEdit(producto)}
            className="px-3 py-1.5 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Editar
          </button>
          <button
            onClick={() => {
              if (confirm("¿Eliminar este producto?")) onDelete(producto.id!);
            }}
            className="px-3 py-1.5 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            Eliminar
          </button>
        </div>
      </div>

      {showIngSelect ? (
        ingredientes ? (
          <div className="mt-3 pt-3 border-t border-gray-100 flex gap-2">
            <select
              value={selectedIng ?? ""}
              onChange={(e) => setSelectedIng(e.target.value ? Number(e.target.value) : null)}
              className="flex-1 border-2 border-gray-200 rounded-xl px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none bg-white"
            >
              <option value="">Seleccionar ingrediente...</option>
              {ingredientesDisponibles.map((ing) => (
                <option key={ing.id} value={ing.id}>{ing.nombre}</option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => {
                if (selectedIng === null) return;
                addIngMutation.mutate(selectedIng);
              }}
              className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Agregar
            </button>
          </div>
        ) : (
          <div className="mt-3 pt-3 border-t border-gray-100 text-sm text-gray-400">
            Cargando ingredientes...
          </div>
        )
      ) : (
        <button
          onClick={() => setShowIngSelect(true)}
          className="mt-2 text-xs text-blue-600 hover:text-blue-800"
        >
          + Agregar ingrediente
        </button>
      )}
    </div>
  );
}
