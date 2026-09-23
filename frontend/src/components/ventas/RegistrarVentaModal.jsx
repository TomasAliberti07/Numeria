import React, { useState } from 'react';
import { registrarVenta } from '../../api/ventas';

export const RegistrarVentaModal = ({ isOpen, onClose, productos, onVentaExitosa }) => {
  const [productoId, setProductoId] = useState('');
  const [cantidad, setCantidad] = useState(1);
  const [precioUnitario, setPrecioUnitario] = useState(0);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSelectProducto = (e) => {
    const id = e.target.value;
    setProductoId(id);
    const prod = productos.find((p) => p.id === parseInt(id));
    if (prod) {
      setPrecioUnitario(prod.precio_venta);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await registrarVenta({
        producto_id: parseInt(productoId),
        cantidad: parseInt(cantidad),
        precio_unitario: parseFloat(precioUnitario),
      });
      onVentaExitosa();
      onClose();
    } catch (err) {
      setError(err.response?.data?.detail || 'Error al procesar la venta');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-50">
      <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 w-full max-w-md text-white">
        <h3 className="text-lg font-bold mb-4">Registrar Nueva Venta</h3>
        {error && <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-2 text-sm rounded mb-3">{error}</div>}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Producto</label>
            <select 
              onChange={handleSelectProducto} 
              className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-sm text-white"
              required
            >
              <option value="">Seleccionar producto...</option>
              {productos.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nombre} (Stock: {p.stock_actual})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Cantidad</label>
              <input 
                type="number" 
                min="1" 
                value={cantidad} 
                onChange={(e) => setCantidad(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-sm text-white"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Precio Unitario ($)</label>
              <input 
                type="number" 
                step="0.01" 
                value={precioUnitario} 
                onChange={(e) => setPrecioUnitario(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-sm text-white"
                required
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded text-sm">
              Cancelar
            </button>
            <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded text-sm font-semibold">
              Confirmar Venta
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};