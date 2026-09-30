import React, { useState } from 'react';
import { X, Loader2, PlusCircle } from 'lucide-react';
import axios from 'axios';

interface AgregarProductoProps {
  isOpen: boolean;
  onClose: () => void;
  onProductoAgregado: () => void;
}

export const AgregarProducto: React.FC<AgregarProductoProps> = ({
  isOpen,
  onClose,
  onProductoAgregado,
}) => {
  const [formData, setFormData] = useState({
    nombre: '',
    categoria: '',
    stock_actual: 0,
    stock_minimo: 5,
    precio_compra: 0,
    precio_venta: 0,
    proveedor_id: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name.includes('stock') || name.includes('precio') ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const apiUrl = ((import.meta as any).env?.VITE_API_URL as string | undefined) || 'http://127.0.0.1:8000/api';
      await axios.post(`${apiUrl}/productos`, formData);
      onProductoAgregado();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Error al guardar el producto');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
          <div className="flex items-center gap-2 text-cyan-400 font-semibold text-lg">
            <PlusCircle className="w-5 h-5" />
            <span>Agregar Nuevo Producto</span>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-xl">{error}</div>}

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Nombre del Producto</label>
            <input
              type="text"
              name="nombre"
              required
              value={formData.nombre}
              onChange={handleChange}
              className="w-full bg-slate-800 border border-slate-700 focus:border-cyan-500 rounded-xl px-3.5 py-2 text-sm text-slate-100 outline-none"
              placeholder="Ej: Teclado Mecánico RGB"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Categoría</label>
              <input
                type="text"
                name="categoria"
                required
                value={formData.categoria}
                onChange={handleChange}
                className="w-full bg-slate-800 border border-slate-700 focus:border-cyan-500 rounded-xl px-3.5 py-2 text-sm text-slate-100 outline-none"
                placeholder="Periféricos"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Stock Inicial</label>
              <input
                type="number"
                name="stock_actual"
                min="0"
                value={formData.stock_actual}
                onChange={handleChange}
                className="w-full bg-slate-800 border border-slate-700 focus:border-cyan-500 rounded-xl px-3.5 py-2 text-sm text-slate-100 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Precio Compra ($)</label>
              <input
                type="number"
                step="0.01"
                name="precio_compra"
                value={formData.precio_compra}
                onChange={handleChange}
                className="w-full bg-slate-800 border border-slate-700 focus:border-cyan-500 rounded-xl px-3.5 py-2 text-sm text-slate-100 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Precio Venta ($)</label>
              <input
                type="number"
                step="0.01"
                name="precio_venta"
                value={formData.precio_venta}
                onChange={handleChange}
                className="w-full bg-slate-800 border border-slate-700 focus:border-cyan-500 rounded-xl px-3.5 py-2 text-sm text-slate-100 outline-none"
              />
            </div>
          </div>

          {/* Footer Botones */}
          <div className="pt-4 flex justify-end gap-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800 text-sm font-medium transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-xl text-sm font-semibold transition flex items-center gap-2 disabled:opacity-50"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />} Guardar Producto
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};