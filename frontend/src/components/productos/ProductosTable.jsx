import React, { useEffect, useState } from 'react';
import { getProductos } from '../../api/productos';

export const ProductosTable = ({ onOpenModal }) => {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProductos()
      .then(setProductos)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-slate-400 p-4">Cargando inventario...</div>;

  return (
    <div className="bg-slate-800 p-5 rounded-xl border border-slate-700">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-white">Gestión de Productos</h2>
        <button 
          onClick={onOpenModal}
          className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium px-4 py-2 rounded-lg text-sm transition"
        >
          + Nuevo Producto
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-300">
          <thead className="bg-slate-900/60 text-slate-400 uppercase text-xs">
            <tr>
              <th className="p-3">ID</th>
              <th className="p-3">Producto</th>
              <th className="p-3">Categoría</th>
              <th className="p-3">P. Venta</th>
              <th className="p-3">Stock</th>
              <th className="p-3">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700">
            {productos.map((prod) => (
              <tr key={prod.id} className="hover:bg-slate-700/30">
                <td className="p-3 font-mono text-slate-500">#{prod.id}</td>
                <td className="p-3 font-medium text-white">{prod.nombre}</td>
                <td className="p-3">{prod.categoria}</td>
                <td className="p-3 text-emerald-400 font-semibold">${prod.precio_venta}</td>
                <td className="p-3">{prod.stock_actual} hs</td>
                <td className="p-3">
                  {prod.stock_actual <= prod.stock_minimo ? (
                    <span className="bg-red-500/10 text-red-400 px-2 py-1 rounded text-xs font-semibold border border-red-500/20">
                      Reordenar
                    </span>
                  ) : (
                    <span className="bg-emerald-500/10 text-emerald-400 px-2 py-1 rounded text-xs font-semibold border border-emerald-500/20">
                      Óptimo
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};