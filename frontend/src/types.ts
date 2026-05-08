export interface Categoria {
  id?: number;
  nombre: string;
  descripcion?: string;
  imagen_url?: string;
  parent_id?: number;
  hijos?: Categoria[];
}

export interface Ingrediente {
  id?: number;
  nombre: string;
  descripcion?: string;
  es_alergeno: boolean;
}

export interface Producto {
  id?: number;
  nombre: string;
  descripcion?: string;
  precio_base: number;
  stock_cantidad: number;
  disponible: boolean;
}
