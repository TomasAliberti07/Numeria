import React, { useEffect, useState } from 'react';
import { getProductos, deleteProducto } from '../../api/productos'; // Asegúrate de tener deleteProducto en api/productos
import { Plus, Package, Search, Edit2, Trash2 } from 'lucide-react';

export const ProductosTable = ({ onOpenModal, onEditProducto, refreshToken }) => {
  const [productos, setProductos] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  const cargarProductos = () => {
    setLoading(true);
    getProductos()
      .then((data) => {
        // Filtrar opcionalmente si solo deseas ver activos si usas borrado lógico
        const productosActivos = Array.isArray(data) 
          ? data.filter((p) => p.is_active !== false) 
          : [];
        setProductos(productosActivos);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    cargarProductos();
  }, [refreshToken]);

  // Borrado Lógico
  const handleEliminar = async (id, nombre) => {
    if (window.confirm(`¿Estás seguro de que deseas eliminar "${nombre}"?`)) {
      try {
        if (typeof deleteProducto === 'function') {
          await deleteProducto(id);
        }
        // Refresco automático eliminando el ítem del estado local
        setProductos((prev) => prev.filter((p) => p.id !== id));
      } catch (error) {
        console.error('Error al eliminar el producto:', error);
        alert('No se pudo eliminar el producto.');
      }
    }
  };

  // Filtrado reactivo en el frontend por Nombre o Categoría
  const productosFiltrados = productos.filter((prod) => {
    const term = searchTerm.toLowerCase();
    return (
      prod.nombre?.toLowerCase().includes(term) ||
      prod.categoria?.toLowerCase().includes(term)
    );
  });

  const obtenerBadgeEstado = (stockActual, stockMinimo) => {
    if (stockActual === 0) {
      return { label: 'Agotado', style: 'bg-red-500/10 text-red-400 border-red-500/20' };
    }
    if (stockActual <= stockMinimo) {
      return { label: 'Crítico', style: 'bg-amber-500/10 text-amber-400 border-amber-500/20' };
    }
    return { label: 'Óptimo', style: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' };
  };

  return (
    <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-xl space-y-4">
      {/* Encabezado y Barra de Acciones */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Package className="w-5 h-5 text-cyan-400" />
          <h2 className="text-xl font-bold text-slate-100">Gestión de Productos</h2>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          {/* Barra de Búsqueda */}
          <div className="relative flex-1 md:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Buscar producto o categoría..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950/60 border border-slate-800 focus:border-cyan-500/50 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-100 placeholder-slate-500 outline-none transition"
            />
          </div>

          {/* Botón de Nuevo Producto */}
          <button
            onClick={onOpenModal}
            className="flex items-center gap-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold px-4 py-2 rounded-xl text-sm transition shadow-lg shadow-cyan-500/10 shrink-0"
          >
            <Plus className="w-4 h-4" /> Nuevo Producto
          </button>
        </div>
      </div>

      {/* Tabla de Productos */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-300">
          <thead className="bg-slate-950/60 text-slate-400 uppercase text-xs tracking-wider">
            <tr>
              <th className="p-3">ID</th>
              <th className="p-3">Producto</th>
              <th className="p-3">Categoría</th>
              <th className="p-3">P. Venta</th>
              <th className="p-3">Stock</th>
              <th className="p-3">Estado</th>
              <th className="p-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80">
            {loading ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-slate-500 font-mono text-sm">
                  Cargando inventario de productos...
                </td>
              </tr>
            ) : productosFiltrados.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-6 text-center text-slate-500">
                  {searchTerm ? 'No se encontraron coincidencias.' : 'No hay productos registrados en el inventario.'}
                </td>
              </tr>
            ) : (
              productosFiltrados.map((prod) => {
                const badge = obtenerBadgeEstado(prod.stock_actual, prod.stock_minimo);
                return (
                  <tr key={prod.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-3 font-mono text-slate-500">#{prod.id}</td>
                    <td className="p-3 font-medium text-slate-100">{prod.nombre}</td>
                    <td className="p-3 text-slate-400">{prod.categoria}</td>
                    <td className="p-3 text-emerald-400 font-semibold font-mono">
                      ${prod.precio_venta?.toLocaleString()}
                    </td>
                    <td className="p-3 text-slate-200 font-mono">{prod.stock_actual} u.</td>
                    <td className="p-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${badge.style}`}>
                        {badge.label}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => onEditProducto && onEditProducto(prod)}
                          className="p-1.5 text-slate-400 hover:text-cyan-400 hover:bg-slate-800 rounded-lg transition"
                          title="Editar producto"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEliminar(prod.id, prod.nombre)}
                          className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition"
                          title="Eliminar producto"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};