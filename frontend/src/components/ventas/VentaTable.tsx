import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { ShoppingBag, Loader2, Plus, Search, Edit2, Trash2, X, AlertCircle } from 'lucide-react';

interface Venta {
  id: number;
  producto_id?: number;
  producto_nombre?: string;
  producto?: string;
  cantidad: number;
  precio_unitario: number;
  total_venta?: number;
  fecha: string;
}

interface Producto {
  id: number;
  nombre: string;
  precio_venta?: number;
  precio?: number;
  stock_actual?: number;
  stock?: number;
}

export const VentaTable: React.FC = () => {
  const [ventas, setVentas] = useState<Venta[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Estados del Modal Embebido (Crear / Editar)
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [ventaAEditar, setVentaAEditar] = useState<Venta | null>(null);
  const [productoId, setProductoId] = useState<string>('');
  const [cantidad, setCantidad] = useState<number | ''>(1);
  const [precioUnitario, setPrecioUnitario] = useState<number | ''>(0);
  const [stockSeleccionado, setStockSeleccionado] = useState<number | null>(null);
  const [modalError, setModalError] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);

  const getApiUrl = () => ((import.meta as any).env?.VITE_API_URL as string | undefined) || 'http://127.0.0.1:8000/api';

  const fetchVentas = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${getApiUrl()}/ventas`);
      setVentas(res.data);
    } catch (error) {
      console.error('Error al cargar historial de ventas:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProductos = async () => {
    try {
      const res = await axios.get(`${getApiUrl()}/productos`);
      setProductos(res.data);
    } catch (error) {
      console.error('Error al cargar productos:', error);
    }
  };

  useEffect(() => {
    fetchVentas();
    fetchProductos();
  }, []);

  // Abrir Modal para Crear
  const handleOpenCrear = () => {
    setVentaAEditar(null);
    setProductoId('');
    setCantidad(1);
    setPrecioUnitario(0);
    setStockSeleccionado(null);
    setModalError('');
    setIsModalOpen(true);
  };

  // Abrir Modal para Modificar (Embebido)
  const handleOpenEditar = (venta: Venta) => {
    setVentaAEditar(venta);
    setProductoId(String(venta.producto_id || ''));
    setCantidad(venta.cantidad);
    setPrecioUnitario(venta.precio_unitario);
    
    // Buscar y mostrar el stock del producto al editar
    const prod = productos.find((p) => p.id === venta.producto_id);
    setStockSeleccionado(prod ? (prod.stock_actual ?? prod.stock ?? 0) : null);
    
    setModalError('');
    setIsModalOpen(true);
  };

  // Manejar selección de producto en el modal
  const handleSelectProducto = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    setProductoId(id);
    const prod = productos.find((p) => p.id === parseInt(id));
    if (prod) {
      setPrecioUnitario(prod.precio_venta || prod.precio || 0);
      setStockSeleccionado(prod.stock_actual ?? prod.stock ?? 0);
    } else {
      setStockSeleccionado(null);
      setPrecioUnitario(0);
    }
  };

  // Guardar Venta (POST o PUT)
  const handleSubmitVenta = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError('');

    if (!productoId) {
      setModalError('Por favor seleccioná un producto');
      return;
    }

    setSubmitting(true);
    try {
      const apiUrl = getApiUrl();
      if (ventaAEditar) {
        // PUT: Modificar
        await axios.put(`${apiUrl}/ventas/${ventaAEditar.id}`, {
          cantidad: Number(cantidad),
          precio_unitario: Number(precioUnitario),
        });
      } else {
        // POST: Crear
        await axios.post(`${apiUrl}/ventas`, {
          producto_id: parseInt(productoId),
          cantidad: Number(cantidad),
          precio_unitario: Number(precioUnitario),
        });
      }

      setIsModalOpen(false);
      fetchVentas(); // Refresco instantáneo automático
    } catch (err: any) {
      setModalError(err.response?.data?.detail || 'Error al procesar la venta');
    } finally {
      setSubmitting(false);
    }
  };

  // Eliminar Venta
  const handleDelete = async (id: number, productoNombre: string) => {
    if (window.confirm(`¿Estás seguro de eliminar la venta de "${productoNombre || 'Producto'}"?`)) {
      try {
        await axios.delete(`${getApiUrl()}/ventas/${id}`);
        setVentas((prev) => prev.filter((v) => v.id !== id));
      } catch (error) {
        console.error('Error al eliminar la venta:', error);
        alert('No se pudo eliminar la venta.');
      }
    }
  };

  // Filtrado reactivo por producto, ID o fecha
  const ventasFiltradas = ventas.filter((v) => {
    const term = searchTerm.toLowerCase();
    const nombreProd = (v.producto_nombre || v.producto || '').toLowerCase();
    const idStr = String(v.id);
    const fechaStr = v.fecha ? v.fecha.toLowerCase() : '';
    return nombreProd.includes(term) || idStr.includes(term) || fechaStr.includes(term);
  });

  const totalCalculado = (Number(cantidad) || 0) * (Number(precioUnitario) || 0);
  const inputNumberStyle = "w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-sm text-slate-100 focus:outline-none focus:border-cyan-500 transition font-mono [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none";

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden space-y-4">
      {/* Encabezado y Barra de Acciones / Búsqueda */}
      <div className="p-5 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-950/40">
        <div className="flex items-center gap-2 text-slate-100 font-semibold">
          <ShoppingBag className="w-5 h-5 text-cyan-400" />
          <span className="text-lg font-bold">Gestión de Ventas</span>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          {/* Barra de Búsqueda */}
          <div className="relative flex-1 md:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Buscar por producto o fecha..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 focus:border-cyan-500/50 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-100 placeholder-slate-500 outline-none transition"
            />
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Botón de recarga redonda eliminado porque ya refresca automáticamente */}
            <button
              onClick={handleOpenCrear}
              className="flex items-center gap-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold px-4 py-2 rounded-xl text-sm transition shadow-lg shadow-cyan-500/10"
            >
              <Plus className="w-4 h-4" /> Registrar Venta
            </button>
          </div>
        </div>
      </div>

      {/* Tabla de Ventas */}
      <div className="overflow-x-auto px-2 pb-2">
        <table className="w-full text-left text-sm text-slate-300">
          <thead className="bg-slate-950/60 text-slate-400 uppercase text-xs tracking-wider">
            <tr>
              <th className="py-3.5 px-4">ID</th>
              <th className="py-3.5 px-4">Producto</th>
              <th className="py-3.5 px-4 text-center">Cantidad</th>
              <th className="py-3.5 px-4 text-right">Precio Unit.</th>
              <th className="py-3.5 px-4 text-right">Total Venta</th>
              <th className="py-3.5 px-4 text-center">Fecha</th>
              <th className="py-3.5 px-4 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {loading ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-slate-500">
                  <div className="flex items-center justify-center gap-2 font-mono text-xs">
                    <Loader2 className="w-5 h-5 animate-spin text-cyan-400" /> Cargando historial de ventas...
                  </div>
                </td>
              </tr>
            ) : ventasFiltradas.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-slate-500">
                  {searchTerm ? 'No se encontraron coincidencias con la búsqueda.' : 'No se registraron ventas históricas todavía.'}
                </td>
              </tr>
            ) : (
              ventasFiltradas.map((v) => {
                const nombreProd = v.producto_nombre || v.producto || 'Producto sin nombre';
                return (
                  <tr key={v.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-mono text-slate-500">#{v.id}</td>
                    <td className="py-3 px-4 font-medium text-slate-100">{nombreProd}</td>
                    <td className="py-3 px-4 text-center font-mono">{v.cantidad} u.</td>
                    <td className="py-3 px-4 text-right font-mono">${v.precio_unitario?.toLocaleString()}</td>
                    <td className="py-3 px-4 text-right font-mono font-semibold text-emerald-400">
                      ${(v.total_venta ?? (v.cantidad * v.precio_unitario))?.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-center text-xs text-slate-400 font-mono">
                      {v.fecha ? new Date(v.fecha).toLocaleString() : '—'}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleOpenEditar(v)}
                          className="p-1.5 text-slate-400 hover:text-cyan-400 hover:bg-slate-800 rounded-lg transition"
                          title="Modificar venta"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(v.id, nombreProd)}
                          className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition"
                          title="Eliminar venta"
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

      {/* Modal Embebido para Registrar o Modificar Venta */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 w-full max-w-md text-slate-100 shadow-2xl relative">
            <div className="flex items-center justify-between mb-5 pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-cyan-400" />
                <h3 className="text-lg font-bold">
                  {ventaAEditar ? 'Modificar Venta' : 'Registrar Nueva Venta'}
                </h3>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-200 p-1 rounded-lg hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {modalError && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-3 text-xs rounded-xl mb-4 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleSubmitVenta} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
                  Producto
                </label>
                <select
                  value={productoId}
                  onChange={handleSelectProducto}
                  disabled={!!ventaAEditar}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-sm text-slate-100 focus:outline-none focus:border-cyan-500 transition disabled:opacity-60"
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

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
                    Cantidad
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={cantidad === 0 ? '' : cantidad}
                    onChange={(e) => setCantidad(e.target.value === '' ? '' : Number(e.target.value))}
                    onFocus={(e) => e.target.select()}
                    className={inputNumberStyle}
                    required
                  />
                  {/* Stock disponible visible tanto al crear como al editar */}
                  {stockSeleccionado !== null && (
                    <span className="block text-[11px] text-slate-500 mt-1 font-mono">
                      Disponible: {stockSeleccionado} u.
                    </span>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
                    Precio Unit. ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={precioUnitario === 0 ? '' : precioUnitario}
                    onChange={(e) => setPrecioUnitario(e.target.value === '' ? '' : Number(e.target.value))}
                    onFocus={(e) => e.target.select()}
                    className={inputNumberStyle}
                    required
                  />
                </div>
              </div>

              <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 flex items-center justify-between text-xs">
                <span className="text-slate-400">Total a cobrar:</span>
                <span className="text-base font-bold font-mono text-emerald-400">
                  ${totalCalculado.toLocaleString()}
                </span>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-sm transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold rounded-xl text-sm transition shadow-lg shadow-cyan-500/10 disabled:opacity-50"
                >
                  {submitting ? 'Guardando...' : ventaAEditar ? 'Guardar Cambios' : 'Confirmar Venta'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};