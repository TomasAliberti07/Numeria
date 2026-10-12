import React, { useEffect, useState } from 'react';
import { X, Loader2, PlusCircle, Edit2 } from 'lucide-react';
import { createProducto, updateProducto } from '../../api/productos';

interface AgregarProductoProps {
  isOpen: boolean;
  onClose: () => void;
  onProductoAgregado: () => void;
  producto?: {
    id: number;
    nombre: string;
    categoria: string;
    stock_actual: number;
    stock_minimo?: number;
    precio_compra?: number;
    precio_venta: number;
    proveedor_id?: number | null;
  } | null;
}

interface ProductoFormData {
  nombre: string;
  categoria: string;
  stock_actual: number;
  stock_minimo: number;
  precio_compra: number;
  precio_venta: number;
  proveedor_id: number | '';
}

export const AgregarProducto: React.FC<AgregarProductoProps> = ({
  isOpen,
  onClose,
  onProductoAgregado,
  producto = null,
}) => {
  const [formData, setFormData] = useState<ProductoFormData>({
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

  useEffect(() => {
    if (!isOpen) return;

    setFormData({
      nombre: producto?.nombre ?? '',
      categoria: producto?.categoria ?? '',
      stock_actual: producto?.stock_actual ?? 0,
      stock_minimo: producto?.stock_minimo ?? 5,
      precio_compra: producto?.precio_compra ?? 0,
      precio_venta: producto?.precio_venta ?? 0,
      proveedor_id: producto?.proveedor_id ?? '',
    });
    setError(null);
  }, [isOpen, producto]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Si el valor está vacío en un input numérico, asignamos 0 o vaciamos según corresponda
    if (name.includes('stock') || name.includes('precio') || name === 'proveedor_id') {
      const numVal = value === '' ? 0 : Number(value);
      setFormData((prev) => ({
        ...prev,
        [name]: numVal,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Sanitizamos el payload asegurando números válidos
      const payload = {
        ...formData,
        stock_actual: Number(formData.stock_actual),
        stock_minimo: Number(formData.stock_minimo),
        precio_compra: Number(formData.precio_compra),
        precio_venta: Number(formData.precio_venta),
        proveedor_id: formData.proveedor_id ? Number(formData.proveedor_id) : null,
      };

      if (producto) {
        await updateProducto(producto.id, payload);
      } else {
        await createProducto(payload);
      }
      onProductoAgregado();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Error al guardar el producto');
    } finally {
      setLoading(false);
    }
  };

  // Clase utilitaria para ocultar las flechitas de los inputs tipo number
  const inputNumberStyle = "w-full bg-slate-800 border border-slate-700 focus:border-cyan-500 rounded-xl px-3.5 py-2 text-sm text-slate-100 outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
          <div className="flex items-center gap-2 text-cyan-400 font-semibold text-lg">
            {producto ? <Edit2 className="w-5 h-5" /> : <PlusCircle className="w-5 h-5" />}
            <span>{producto ? 'Editar Producto' : 'Agregar Nuevo Producto'}</span>
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
              <label className="block text-xs font-medium text-slate-400 mb-1">
                {producto ? 'Stock Actual' : 'Stock Inicial'}
              </label>
              <input
                type="number"
                name="stock_actual"
                min="0"
                value={formData.stock_actual === 0 ? '' : formData.stock_actual}
                onChange={handleChange}
                onFocus={(e) => e.target.select()}
                placeholder="0"
                className={inputNumberStyle}
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
                value={formData.precio_compra === 0 ? '' : formData.precio_compra}
                onChange={handleChange}
                onFocus={(e) => e.target.select()}
                placeholder="0.00"
                className={inputNumberStyle}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Precio Venta ($)</label>
              <input
                type="number"
                step="0.01"
                name="precio_venta"
                value={formData.precio_venta === 0 ? '' : formData.precio_venta}
                onChange={handleChange}
                onFocus={(e) => e.target.select()}
                placeholder="0.00"
                className={inputNumberStyle}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Stock Mínimo</label>
            <input
              type="number"
              name="stock_minimo"
              min="0"
              value={formData.stock_minimo}
              onChange={handleChange}
              onFocus={(e) => e.target.select()}
              className={inputNumberStyle}
            />
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
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {producto ? 'Guardar Cambios' : 'Guardar Producto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};