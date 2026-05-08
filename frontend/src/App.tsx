import { Routes, Route, Link, useLocation } from "react-router-dom";
import CategoriasPage from "./pages/CategoriasPage";
import IngredientesPage from "./pages/IngredientesPage";
import ProductosPage from "./pages/ProductosPage";
import ProductoDetallePage from "./pages/ProductoDetallePage";

export default function App() {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-gradient-to-r from-gray-900 to-gray-800 text-white shadow-xl">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <span className="font-bold text-xl tracking-tight">Gestión de Productos</span>
            </div>
            <div className="flex gap-1">
              <Link
                to="/categorias"
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  isActive("/categorias") 
                    ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/30" 
                    : "text-gray-300 hover:text-white hover:bg-white/10"
                }`}
              >
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  Categorías
                </span>
              </Link>
              <Link
                to="/ingredientes"
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  isActive("/ingredientes") 
                    ? "bg-amber-500 text-white shadow-lg shadow-amber-500/30" 
                    : "text-gray-300 hover:text-white hover:bg-white/10"
                }`}
              >
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                  Ingredientes
                </span>
              </Link>
              <Link
                to="/productos"
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  isActive("/productos") 
                    ? "bg-blue-500 text-white shadow-lg shadow-blue-500/30" 
                    : "text-gray-300 hover:text-white hover:bg-white/10"
                }`}
              >
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                  Productos
                </span>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <Routes>
        <Route path="/" element={<CategoriasPage />} />
        <Route path="/categorias" element={<CategoriasPage />} />
        <Route path="/ingredientes" element={<IngredientesPage />} />
        <Route path="/productos" element={<ProductosPage />} />
        <Route path="/productos/:id" element={<ProductoDetallePage />} />
      </Routes>
    </div>
  );
}