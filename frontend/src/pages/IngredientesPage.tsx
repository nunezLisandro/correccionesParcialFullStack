import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ingredienteApi } from "../api";
import type { Ingrediente } from "../types";
import { IngredienteCard } from "../components/Cards";
import { FormModal } from "../components/Modal";

export default function IngredientesPage() {
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editData, setEditData] = useState<Ingrediente | null>(null);
  const [formData, setFormData] = useState({ nombre: "" });

  const { data: ingredientes, error, isFetching } = useQuery({
    queryKey: ["ingredientes"],
    queryFn: () => ingredienteApi.getAll().then((res) => res.data),
  });

  const createMutation = useMutation({
    mutationFn: (data: { nombre: string }) => ingredienteApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ingredientes"] });
      closeModal();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: { nombre: string } }) =>
      ingredienteApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ingredientes"] });
      closeModal();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => ingredienteApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ingredientes"] });
    },
  });

  const openModal = (ingrediente?: Ingrediente) => {
    if (ingrediente) {
      setEditData(ingrediente);
      setFormData({ nombre: ingrediente.nombre });
    } else {
      setEditData(null);
      setFormData({ nombre: "" });
    }
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditData(null);
    setFormData({ nombre: "" });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editData?.id) {
      updateMutation.mutate({ id: editData.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  if (error) return (
    <div className="p-8 max-w-4xl mx-auto text-center">
      <p className="text-red-600 text-lg font-semibold mb-2">Error al cargar los ingredientes</p>
      <p className="text-gray-500 text-sm mb-4">Verificá que el backend esté corriendo en http://localhost:8000</p>
      <button
        onClick={() => window.location.reload()}
        className="px-4 py-2 bg-amber-500 text-white rounded-xl hover:bg-amber-600 transition-colors"
      >
        Reintentar
      </button>
    </div>
  );

  if (isFetching && !ingredientes) return <div className="p-8 text-center text-gray-500">Cargando...</div>;

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <span className="w-3 h-3 rounded-full bg-amber-500"></span>
          <h1 className="text-3xl font-bold text-gray-800">Ingredientes</h1>
        </div>
        <p className="text-gray-500 ml-6">Gestiona los ingredientes disponibles</p>
      </div>

      <button
        onClick={() => openModal()}
        className="mb-6 bg-amber-500 text-white px-5 py-2.5 rounded-xl hover:bg-amber-600 transition-colors font-medium shadow-lg shadow-amber-500/20 flex items-center gap-2"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        Nuevo Ingrediente
      </button>

      {ingredientes?.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-dashed border-gray-300">
          <p className="text-gray-500">No hay ingredientes creados</p>
          <p className="text-gray-400 text-sm mt-1">Crea tu primer ingrediente para comenzar</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {ingredientes?.map((ing: Ingrediente) => (
            <IngredienteCard
              key={ing.id}
              ingrediente={ing}
              onEdit={openModal}
              onDelete={(id) => {
                if (confirm("¿Eliminar este ingrediente?")) deleteMutation.mutate(id);
              }}
            />
          ))}
        </div>
      )}

      <FormModal
        isOpen={modalOpen}
        onClose={closeModal}
        title={editData ? "Editar Ingrediente" : "Nuevo Ingrediente"}
        onSubmit={handleSubmit}
      >
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Nombre</label>
          <input
            type="text"
            value={formData.nombre}
            onChange={(e) => setFormData({ nombre: e.target.value })}
            className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 focus:border-amber-500 focus:outline-none transition-colors"
            placeholder="Ej: Tomate, Queso, Pollo..."
            required
            autoFocus
          />
        </div>
      </FormModal>
    </div>
  );
}