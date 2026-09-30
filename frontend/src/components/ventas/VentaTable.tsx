import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { ShoppingBag, Loader2, RefreshCw, Plus } from 'lucide-react';

interface Venta {
  id: number;
  producto_nombre?: string;
  producto?: string;
  cantidad: number;
  precio_unitario: number;
  total_venta?: number;
  fecha: string;
}

interface VentaTableProps {
  onOpenModal?: () => void;
}

export const VentaTable: React.FC<VentaTableProps> = ({ onOpenModal }) => {
  const [ventas, setVentas] = useState<Venta[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchVentas = async () => {
    setLoading(true);
    try {
      const apiUrl = ((import.meta as any).env?.VITE_API_URL as string | undefined) || 'http://127.0.0.1:8000/api';
      const res = await axios.get(`${apiUrl}/ventas`);
      setVentas(res.data);
    } catch (error) {
      console.error('Error al cargar historial de ventas:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVentas();
  }, []);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
      {/* Encabezado con Botón de Nueva Venta */}
      <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
        <div className="flex items-center gap-2 text-slate-100 font-semibold">
          <ShoppingBag className="w-5 h-5 text-cyan-400" />
          <span className="text-lg font-bold">Gestión de Ventas</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchVentas}
            className="p-2 text-slate-400 hover:text-cyan-400 hover:bg-slate-800 rounded-xl transition"
            title="Actualizar tabla"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          {onOpenModal && (
            <button
              onClick={onOpenModal}
              className="flex items-center gap-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold px-4 py-2 rounded-xl text-sm transition shadow-lg shadow-cyan-500/10"
            >
              <Plus className="w-4 h-4" /> Registrar Venta
            </button>
          )}
        </div>
      </div>

      {/* Tabla de Ventas */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-300">
          <thead className="bg-slate-950/60 text-slate-400 uppercase text-xs tracking-wider">
            <tr>
              <th className="py-3.5 px-4">ID</th>
              <th className="py-3.5 px-4">Producto</th>
              <th className="py-3.5 px-4 text-center">Cantidad</th>
              <th className="py-3.5 px-4 text-right">Precio Unit.</th>
              <th className="py-3.5 px-4 text-right">Total Venta</th>
              <th className="py-3.5 px-4 text-center">Fecha</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {loading ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-500">
                  <div className="flex items-center justify-center gap-2 font-mono text-xs">
                    <Loader2 className="w-5 h-5 animate-spin text-cyan-400" /> Cargando historial de ventas...
                  </div>
                </td>
              </tr>
            ) : ventas.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-500">
                  No se registraron ventas históricas todavía.
                </td>
              </tr>
            ) : (
              ventas.map((v) => (
                <tr key={v.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-4 font-mono text-slate-500">#{v.id}</td>
                  <td className="py-3 px-4 font-medium text-slate-100">
                    {v.producto_nombre || v.producto || 'Producto sin nombre'}
                  </td>
                  <td className="py-3 px-4 text-center font-mono">{v.cantidad} u.</td>
                  <td className="py-3 px-4 text-right font-mono">${v.precio_unitario?.toLocaleString()}</td>
                  <td className="py-3 px-4 text-right font-mono font-semibold text-emerald-400">
                    ${(v.total_venta ?? (v.cantidad * v.precio_unitario))?.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-center text-xs text-slate-400 font-mono">
                    {v.fecha ? new Date(v.fecha).toLocaleDateString() : '—'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};