import React, { useState } from 'react';
import { registrarVenta } from '../../api/ventas';
import { X, ShoppingBag, AlertCircle } from 'lucide-react';

export const RegistrarVentaModal = ({ isOpen, onClose, productos = [], onVentaExitosa }) => {
  const [productoId, setProductoId] = useState('');
  const [cantidad, setCantidad] = useState(1);
  const [precioUnitario, setPrecioUnitario] = useState(0);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSelectProducto = (e) => {
    const id = e.target.value;
    setProductoId(id);
    const prod = productos.find((p) => p.id === parseInt(id));
    if (prod) {
      setPrecioUnitario(prod.precio_venta || prod.precio || 0);
    }
  };

  const totalCalculado = (parseInt(cantidad) || 0) * (parseFloat(precioUnitario) || 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!productoId) {
      setError('Por favor seleccioná un producto');
      return;
    }

    setSubmitting(true);
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
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex justify-center items-center z-50 p-4">
      <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 w-full max-w-md text-slate-100 shadow-2xl relative">
        {/* Header */}
        <div className="flex items-center justify-between mb-5 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-cyan-400" />
            <h3 className="text-lg font-bold">Registrar Nueva Venta</h3>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 p-1 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-3 text-xs rounded-xl mb-4 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Selector de producto */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
              Producto
            </label>
            <select
              value={productoId}
              onChange={handleSelectProducto}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-sm text-slate-100 focus:outline-none focus:border-cyan-500 transition"
              required
            >
              <option value="">Seleccionar producto...</option>
              {productos.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nombre} — Stock: {p.stock_actual ?? p.stock ?? 0} u.
                </option>
              ))}
            </select>
          </div>

          {/* Cantidad y Precio */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
                Cantidad
              </label>
              <input
                type="number"
                min="1"
                value={cantidad}
                onChange={(e) => setCantidad(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-sm text-slate-100 focus:outline-none focus:border-cyan-500 transition font-mono"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
                Precio Unit. ($)
              </label>
              <input
                type="number"
                step="0.01"
                value={precioUnitario}
                onChange={(e) => setPrecioUnitario(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-sm text-slate-100 focus:outline-none focus:border-cyan-500 transition font-mono"
                required
              />
            </div>
          </div>

          {/* Resumen Total */}
          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 flex items-center justify-between text-xs">
            <span className="text-slate-400">Total a cobrar:</span>
            <span className="text-base font-bold font-mono text-emerald-400">
              ${totalCalculado.toLocaleString()}
            </span>
          </div>

          {/* Botones */}
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-sm transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold rounded-xl text-sm transition shadow-lg shadow-cyan-500/10 disabled:opacity-50"
            >
              {submitting ? 'Guardando...' : 'Confirmar Venta'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};