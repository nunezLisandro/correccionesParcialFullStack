import type { Categoria, Ingrediente, Producto } from "../types";

interface CardProps {
  nombre: string;
  onEdit: () => void;
  onDelete: () => void;
}

function Card({ nombre, onEdit, onDelete }: CardProps) {
  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 p-5 border border-gray-100">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800 truncate">{nombre}</h3>
        <div className="flex gap-2">
          <button
            onClick={onEdit}
            className="px-3 py-1.5 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Editar
          </button>
          <button
            onClick={onDelete}
            className="px-3 py-1.5 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
}

interface CategoriaCardProps {
  categoria: Categoria;
  onEdit: (categoria: Categoria) => void;
  onDelete: (id: number) => void;
}

export function CategoriaCard({ categoria, onEdit, onDelete }: CategoriaCardProps) {
  return (
    <Card
      nombre={categoria.nombre}
      onEdit={() => onEdit(categoria)}
      onDelete={() => onDelete(categoria.id!)}
    />
  );
}

interface IngredienteCardProps {
  ingrediente: Ingrediente;
  onEdit: (ingrediente: Ingrediente) => void;
  onDelete: (id: number) => void;
}

export function IngredienteCard({ ingrediente, onEdit, onDelete }: IngredienteCardProps) {
  return (
    <Card
      nombre={ingrediente.nombre}
      onEdit={() => onEdit(ingrediente)}
      onDelete={() => onDelete(ingrediente.id!)}
    />
  );
}

interface ProductoCardProps {
  producto: Producto;
  onEdit: (producto: Producto) => void;
  onDelete: (id: number) => void;
}

export function ProductoCard({ producto, onEdit, onDelete }: ProductoCardProps) {
  return (
    <Card
      nombre={producto.nombre}
      onEdit={() => onEdit(producto)}
      onDelete={() => onDelete(producto.id!)}
    />
  );
}

export { Card };