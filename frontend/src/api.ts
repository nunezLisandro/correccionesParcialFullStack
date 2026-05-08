import axios from "axios";
import type { Categoria, Ingrediente, Producto } from "./types";

const api = axios.create({
  baseURL: "http://localhost:8000",
});

export const categoriaApi = {
  getAll: (nombre?: string) =>
    api.get<Categoria[]>("/categorias/", { params: nombre ? { nombre } : {} }),
  getById: (id: number) => api.get<Categoria>(`/categorias/${id}`),
  create: (data: { nombre: string; descripcion?: string; imagen_url?: string; parent_id?: number }) =>
    api.post<Categoria>("/categorias/", data),
  update: (id: number, data: { nombre?: string; descripcion?: string; imagen_url?: string; parent_id?: number }) =>
    api.put<Categoria>(`/categorias/${id}`, data),
  delete: (id: number) => api.delete(`/categorias/${id}`),
};

export const ingredienteApi = {
  getAll: (nombre?: string) =>
    api.get<Ingrediente[]>("/ingredientes/", { params: nombre ? { nombre } : {} }),
  getById: (id: number) => api.get<Ingrediente>(`/ingredientes/${id}`),
  create: (data: { nombre: string; descripcion?: string; es_alergeno?: boolean }) =>
    api.post<Ingrediente>("/ingredientes/", data),
  update: (id: number, data: { nombre?: string; descripcion?: string; es_alergeno?: boolean }) =>
    api.put<Ingrediente>(`/ingredientes/${id}`, data),
  delete: (id: number) => api.delete(`/ingredientes/${id}`),
};

export const productoApi = {
  getAll: () => api.get<Producto[]>("/productos/"),
  getById: (id: number) => api.get<Producto>(`/productos/${id}`),
  create: (data: { nombre: string; descripcion?: string; precio_base?: number; stock_cantidad?: number; disponible?: boolean; categoria_id?: number }) =>
    api.post<Producto>("/productos/", data),
  update: (id: number, data: { nombre?: string; descripcion?: string; precio_base?: number; stock_cantidad?: number; disponible?: boolean }) =>
    api.put<Producto>(`/productos/${id}`, data),
  delete: (id: number) => api.delete(`/productos/${id}`),
  getCategoria: (id: number) => api.get<Categoria>(`/productos/${id}/categoria`),
  getIngredientes: (id: number) => api.get<Ingrediente[]>(`/productos/${id}/ingredientes`),
};

export const productoCategoriaApi = {
  getProductosByCategoria: (categoriaId: number) =>
    api.get<Producto[]>(`/producto-categoria/categoria/${categoriaId}/productos`),
  asignarCategoria: (productoId: number, categoriaId: number) =>
    api.put(`/producto-categoria/producto/${productoId}/categoria/${categoriaId}`),
  removerCategoria: (productoId: number, categoriaId: number) =>
    api.delete(`/producto-categoria/producto/${productoId}/categoria/${categoriaId}`),
};

export const productoIngredienteApi = {
  asignarIngrediente: (productoId: number, ingredienteId: number, esRemovible: boolean = false) =>
    api.post(`/producto-ingrediente/producto/${productoId}/ingrediente/${ingredienteId}`, null, {
      params: { es_removible: esRemovible },
    }),
  removerIngrediente: (productoId: number, ingredienteId: number) =>
    api.delete(`/producto-ingrediente/producto/${productoId}/ingrediente/${ingredienteId}`),
};

export default api;
