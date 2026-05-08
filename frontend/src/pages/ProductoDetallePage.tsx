import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { productoApi, categoriaApi, ingredienteApi, productoIngredienteApi } from "../api";
import type { Categoria, Ingrediente } from "../types";
import { FormModal } from "../components/Modal";

export default function ProductoDetallePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const productId = Number(id);

  const [ingModalOpen, setIngModalOpen] = useState(false);
  const [selectedIngrediente, setSelectedIngrediente] = useState<number | null>(null);

  const { data: producto, isLoading, error } = useQuery({
    queryKey: ["producto", productId],
    queryFn: () => productoApi.getById(productId).then((res) => res.data),
  });

  const { data: categoria, isLoading: catLoading } = useQuery({
    queryKey: ["producto-categoria", productId],
    queryFn: () => productoApi.getCategoria(productId).then((res) => res.data),
    enabled: !!producto,
  });

  const { data: ingredientes, isLoading: ingLoading } = useQuery({
    queryKey: ["producto-ingredientes", productId],
    queryFn: () => productoApi.getIngredientes(productId).then((res) => res.data),
    enabled: !!producto,
  });

  const { data: todosIngredientes } = useQuery({
    queryKey: ["ingredientes"],
    queryFn: () => ingredienteApi.getAll().then((res) => res.data),
  });

  const { data: categorias } = useQuery({
    queryKey: ["categorias"],
    queryFn: () => categoriaApi.getAll().then((res) => res.data),
  });

  const removeIngMutation = useMutation({
    mutationFn: (ingredienteId: number) =>
      productoIngredienteApi.removerIngrediente(productId, ingredienteId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["producto-ingredientes", productId] });
    },
  });

  const addIngMutation = useMutation({
    mutationFn: (ingredienteId: number) => {
      if (!productId) return Promise.reject(new Error("ID de producto inválido"));
      return productoIngredienteApi.asignarIngrediente(productId, ingredienteId, false);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["producto-ingredientes", productId] });
      setIngModalOpen(false);
      setSelectedIngrediente(null);
    },
    onError: (err: unknown) => {
      const e = err as { response?: { data?: { detail?: string } }; message?: string };
      alert("Error al agregar ingrediente: " + (e.response?.data?.detail || e.message || "Error desconocido"));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => productoApi.delete(productId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["productos"] });
      navigate("/productos");
    },
  });

  if (isLoading) return <div className="p-8 text-center text-gray-500">Cargando...</div>;
  if (error) return (
    <div className="p-8 max-w-4xl mx-auto text-center">
      <p className="text-red-600 text-lg font-semibold mb-2">Producto no encontrado</p>
      <Link to="/productos" className="text-blue-600 hover:underline">Volver a productos</Link>
    </div>
  );
  if (!producto) return null;

  const ingredienteIds = ingredientes?.map((i) => i.id) ?? [];
  const ingredientesDisponibles = todosIngredientes?.filter((i) => !ingredienteIds.includes(i.id)) ?? [];

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <Link to="/productos" className="text-blue-600 hover:underline text-sm mb-2 inline-block">
              &larr; Volver a productos
            </Link>
            <h1 className="text-3xl font-bold text-gray-800">{producto.nombre}</h1>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => {
                if (confirm("¿Eliminar este producto?")) deleteMutation.mutate();
              }}
              className="px-4 py-2 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              Eliminar
            </button>
          </div>
        </div>
      </div>

      <div className="grid gap-6">
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Información</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-sm text-gray-500">Precio base</span>
              <p className="text-xl font-bold text-green-600">${producto.precio_base}</p>
            </div>
            <div>
              <span className="text-sm text-gray-500">Stock</span>
              <p className="text-xl font-bold text-gray-800">{producto.stock_cantidad}</p>
            </div>
            <div>
              <span className="text-sm text-gray-500">Disponible</span>
              <p className={`text-xl font-bold ${producto.disponible ? "text-green-600" : "text-red-600"}`}>
                {producto.disponible ? "Sí" : "No"}
              </p>
            </div>
            <div>
              <span className="text-sm text-gray-500">Categoría</span>
              {catLoading ? (
                <p className="text-gray-400">Cargando...</p>
              ) : categoria?.nombre ? (
                <p className="text-xl font-bold text-gray-800">{categoria.nombre}</p>
              ) : (
                <p className="text-gray-400">Sin categoría</p>
              )}
            </div>
          </div>
          {producto.descripcion && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <span className="text-sm text-gray-500">Descripción</span>
              <p className="text-gray-700 mt-1">{producto.descripcion}</p>
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Ingredientes ({ingredientes?.length ?? 0})</h2>
            <button
              onClick={() => setIngModalOpen(true)}
              className="px-3 py-1.5 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Agregar
            </button>
          </div>
          {ingLoading ? (
            <p className="text-gray-400">Cargando...</p>
          ) : ingredientes?.length === 0 ? (
            <p className="text-gray-500 text-sm">Sin ingredientes asignados</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {ingredientes?.map((ing: Ingrediente) => (
                <span
                  key={ing.id}
                  className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
                    ing.es_alergeno
                      ? "bg-red-100 text-red-700"
                      : "bg-amber-100 text-amber-700"
                  }`}
                >
                  {ing.nombre}
                  {ing.es_alergeno && <span className="text-xs">(alérgeno)</span>}
                  <button
                    onClick={() => removeIngMutation.mutate(ing.id!)}
                    className="ml-1 text-red-500 hover:text-red-700 font-bold"
                    title="Quitar"
                  >
                    &times;
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Cambiar categoría</h2>
          <CategoriaSelect productId={productId} categorias={categorias ?? []} />
        </div>
      </div>

      <FormModal
        isOpen={ingModalOpen}
        onClose={() => { setIngModalOpen(false); setSelectedIngrediente(null); }}
        title="Agregar Ingrediente"
        onSubmit={(e) => {
          e.preventDefault();
          if (selectedIngrediente) addIngMutation.mutate(selectedIngrediente);
        }}
      >
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Ingrediente</label>
          {ingredientes ? (
            <select
              value={selectedIngrediente ?? ""}
              onChange={(e) => setSelectedIngrediente(e.target.value ? Number(e.target.value) : null)}
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 focus:border-blue-500 focus:outline-none transition-colors bg-white"
              required
            >
              <option value="">Seleccionar...</option>
              {ingredientesDisponibles.map((ing: Ingrediente) => (
                <option key={ing.id} value={ing.id}>
                  {ing.nombre}{ing.es_alergeno ? " (alérgeno)" : ""}
                </option>
              ))}
            </select>
          ) : (
            <p className="text-sm text-gray-400">Cargando ingredientes disponibles...</p>
          )}
        </div>
      </FormModal>
    </div>
  );
}

function CategoriaSelect({ productId, categorias }: { productId: number; categorias: Categoria[] }) {
  const queryClient = useQueryClient();
  const [selectedParent, setSelectedParent] = useState<number | null>(null);
  const [selectedSubcat, setSelectedSubcat] = useState<number | null>(null);

  const { data: categoriaActual } = useQuery({
    queryKey: ["producto-categoria", productId],
    queryFn: () => productoApi.getCategoria(productId).then((res) => res.data),
  });

  useEffect(() => {
    if (categoriaActual) {
      setSelectedParent(categoriaActual.parent_id ?? null);
      setSelectedSubcat(categoriaActual.id ?? null);
    }
  }, [categoriaActual]);

  const padres = (categorias ?? []).filter((c: Categoria) => !c.parent_id);
  const subcats = (selectedParent ?? categoriaActual?.parent_id)
    ? (categorias ?? []).filter((c: Categoria) => c.parent_id === (selectedParent ?? categoriaActual?.parent_id))
    : [];

  const asignarMutation = useMutation({
    mutationFn: (categoriaId: number) =>
      fetch(`http://localhost:8000/producto-categoria/producto/${productId}/categoria/${categoriaId}`, {
        method: "PUT",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["producto-categoria", productId] });
    },
  });

  const catId = selectedSubcat ?? (selectedParent !== null && subcats.length === 0 ? selectedParent : null) ?? categoriaActual?.id;

  return (
    <div className="flex gap-2 items-start">
      <div className="flex flex-col gap-2 flex-1">
        <select
          value={selectedParent ?? categoriaActual?.parent_id ?? ""}
          onChange={(e) => {
            setSelectedParent(e.target.value ? Number(e.target.value) : null);
            setSelectedSubcat(null);
          }}
          className="border-2 border-gray-200 rounded-xl px-4 py-2.5 focus:border-blue-500 focus:outline-none bg-white"
        >
          <option value="">Sin categoría</option>
          {padres.map((c: Categoria) => (
            <option key={c.id} value={c.id}>{c.nombre}</option>
          ))}
        </select>
        {subcats.length > 0 && (
          <select
            value={selectedSubcat ?? categoriaActual?.id ?? ""}
            onChange={(e) => setSelectedSubcat(e.target.value ? Number(e.target.value) : null)}
            className="border-2 border-gray-200 rounded-xl px-4 py-2.5 focus:border-blue-500 focus:outline-none bg-white"
          >
            <option value="">Subcategoría...</option>
            {subcats.map((c: Categoria) => (
              <option key={c.id} value={c.id}>{c.nombre}</option>
            ))}
          </select>
        )}
      </div>
      <button
        onClick={() => catId && asignarMutation.mutate(catId)}
        className="px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium self-end"
      >
        Asignar
      </button>
    </div>
  );
}
