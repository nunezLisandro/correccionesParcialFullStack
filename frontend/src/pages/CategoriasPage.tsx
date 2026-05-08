import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { categoriaApi } from "../api";
import type { Categoria } from "../types";
import { CategoriaCard } from "../components/Cards";
import { FormModal } from "../components/Modal";

export default function CategoriasPage() {
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editData, setEditData] = useState<Categoria | null>(null);
  const [formData, setFormData] = useState({ nombre: "", parent_id: null as number | null });

  const { data: categorias, error, isFetching } = useQuery({
    queryKey: ["categorias"],
    queryFn: () => categoriaApi.getAll().then((res) => res.data),
  });

  const createMutation = useMutation({
    mutationFn: (data: { nombre: string; parent_id?: number }) => {
      const payload: { nombre: string; parent_id?: number } = { nombre: data.nombre };
      if (data.parent_id != null) payload.parent_id = data.parent_id;
      return categoriaApi.create(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categorias"] });
      closeModal();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: { nombre?: string; parent_id?: number } }) => {
      const payload: { nombre?: string; parent_id?: number } = {};
      if (data.nombre !== undefined) payload.nombre = data.nombre;
      if (data.parent_id != null) payload.parent_id = data.parent_id;
      return categoriaApi.update(id, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categorias"] });
      closeModal();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => categoriaApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categorias"] });
    },
  });

  const openModal = (categoria?: Categoria) => {
    if (categoria) {
      setEditData(categoria);
      setFormData({ nombre: categoria.nombre, parent_id: categoria.parent_id ?? null });
    } else {
      setEditData(null);
      setFormData({ nombre: "", parent_id: null });
    }
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditData(null);
    setFormData({ nombre: "", parent_id: null });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data: { nombre: string; parent_id?: number } = { nombre: formData.nombre };
    if (formData.parent_id != null) data.parent_id = formData.parent_id;
    if (editData?.id) {
      updateMutation.mutate({ id: editData.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  if (error) return (
    <div className="p-8 max-w-4xl mx-auto text-center">
      <p className="text-red-600 text-lg font-semibold mb-2">Error al cargar las categorías</p>
      <p className="text-gray-500 text-sm mb-4">Verificá que el backend esté corriendo en http://localhost:8000</p>
      <button
        onClick={() => window.location.reload()}
        className="px-4 py-2 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-colors"
      >
        Reintentar
      </button>
    </div>
  );

  if (isFetching && !categorias) return <div className="p-8 text-center text-gray-500">Cargando...</div>;

  const rootCategorias = categorias?.filter((c: Categoria) => !c.parent_id) ?? [];

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
          <h1 className="text-3xl font-bold text-gray-800">Categorías</h1>
        </div>
        <p className="text-gray-500 ml-6">Gestiona las categorías de tus productos</p>
      </div>

      <button
        onClick={() => openModal()}
        className="mb-6 bg-emerald-500 text-white px-5 py-2.5 rounded-xl hover:bg-emerald-600 transition-colors font-medium shadow-lg shadow-emerald-500/20 flex items-center gap-2"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        Nueva Categoría
      </button>

      {categorias?.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-dashed border-gray-300">
          <p className="text-gray-500">No hay categorías creadas</p>
          <p className="text-gray-400 text-sm mt-1">Crea tu primera categoría para comenzar</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {rootCategorias.map((cat: Categoria) => (
            <div key={cat.id}>
              <CategoriaCard
                categoria={cat}
                onEdit={openModal}
                onDelete={(id) => {
                  if (confirm("¿Eliminar esta categoría?")) deleteMutation.mutate(id);
                }}
              />
              {cat.hijos && cat.hijos.length > 0 && (
                <div className="ml-8 mt-2 space-y-2 border-l-2 border-emerald-200 pl-4">
                  {cat.hijos.map((hijo: Categoria) => (
                    <CategoriaCard
                      key={hijo.id}
                      categoria={hijo}
                      onEdit={openModal}
                      onDelete={(id) => {
                        if (confirm("¿Eliminar esta subcategoría?")) deleteMutation.mutate(id);
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          ))}
          {categorias?.filter((c: Categoria) => !c.parent_id && !rootCategorias.some((r: Categoria) => r.id === c.id)).map((cat: Categoria) => (
            <CategoriaCard
              key={cat.id}
              categoria={cat}
              onEdit={openModal}
              onDelete={(id) => {
                if (confirm("¿Eliminar esta categoría?")) deleteMutation.mutate(id);
              }}
            />
          ))}
        </div>
      )}

      <FormModal
        isOpen={modalOpen}
        onClose={closeModal}
        title={editData ? "Editar Categoría" : "Nueva Categoría"}
        onSubmit={handleSubmit}
      >
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Nombre</label>
          <input
            type="text"
            value={formData.nombre}
            onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
            className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 focus:border-emerald-500 focus:outline-none transition-colors"
            placeholder="Ej: Bebidas, Comidas, Postres..."
            required
            autoFocus
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Categoría padre <span className="text-gray-400 font-normal">(opcional, para subcategorías)</span>
          </label>
          <select
            value={formData.parent_id ?? ""}
            onChange={(e) => setFormData({ ...formData, parent_id: e.target.value ? Number(e.target.value) : null })}
            className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 focus:border-emerald-500 focus:outline-none transition-colors bg-white"
          >
            <option value="">Sin categoría padre</option>
            {categorias
              ?.filter((c: Categoria) => !c.parent_id && c.id !== editData?.id)
              .map((cat: Categoria) => (
                <option key={cat.id} value={cat.id}>
                  {cat.nombre}
                </option>
              ))}
          </select>
        </div>
      </FormModal>
    </div>
  );
}
