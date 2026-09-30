import React, { useEffect, useState } from 'react';
import { getProductos } from '../../api/productos';
import { Plus, RefreshCw, Package } from 'lucide-react';

export const ProductosTable = ({ onOpenModal }) => {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);

  const cargarProductos = () => {
    setLoading(true);
    getProductos()
      .then(setProductos)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    cargarProductos();
  }, []);

  // Función para determinar la etiqueta y estilos dinámicos del estado
  const obtenerBadgeEstado = (stockActual, stockMinimo) => {
    if (stockActual === 0) {
      return { label: 'Agotado', style: 'bg-red-500/10 text-red-400 border-red-500/20' };
    }
    if (stockActual <= stockMinimo) {
      return { label: 'Crítico', style: 'bg-amber-500/10 text-amber-400 border-amber-500/20' };
    }
    return { label: 'Óptimo', style: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' };
  };

  if (loading) {
    return (
      <div className="bg-slate-900 p-8 rounded-2xl border border-slate-800 text-center text-slate-400 font-mono text-sm">
        Cargando inventario de productos...
      </div>
    );
  }

  return (
    <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-xl">
      {/* Encabezado y Botón de Acción */}
      <div className="flex justify-between items-center mb-5">
        <div className="flex items-center gap-2">
          <Package className="w-5 h-5 text-cyan-400" />
          <h2 className="text-xl font-bold text-slate-100">Gestión de Productos</h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={cargarProductos}
            className="p-2 text-slate-400 hover:text-cyan-400 hover:bg-slate-800 rounded-xl transition"
            title="Recargar inventario"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={onOpenModal}
            className="flex items-center gap-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold px-4 py-2 rounded-xl text-sm transition shadow-lg shadow-cyan-500/10"
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
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80">
            {productos.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-6 text-center text-slate-500">
                  No hay productos registrados en el inventario.
                </td>
              </tr>
            ) : (
              productos.map((prod) => {
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