import React, { useEffect, useState } from 'react';
import { getDashboardStats, getProductos } from '../api/productos';
import { ProductosTable } from './productos/ProductosTable';
import { ProveedoresList } from './proveedores/ProveedoresList';
import { RegistrarVentaModal } from './ventas/RegistrarVentaModal';
import { 
  Package, 
  TrendingUp, 
  Users, 
  AlertTriangle, 
  Plus, 
  Sparkles 
} from 'lucide-react';

export const Dashboard = ({ onOpenChat }) => {
  const [stats, setStats] = useState(null);
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isVentaModalOpen, setIsVentaModalOpen] = useState(false);

  // Carga de datos de la API real
  const cargarDatos = () => {
    setLoading(true);
    Promise.all([getDashboardStats(), getProductos()])
      .then(([statsData, productosData]) => {
        setStats(statsData);
        setProductos(productosData);
      })
      .catch((err) => console.error("Error al cargar el dashboard:", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  return (
    <div className="p-8 space-y-6 flex-1 max-w-7xl mx-auto">
      {/* Encabezado Principal */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-100">
            Panel de Control
          </h1>
          <p className="text-xs text-slate-400">
            Monitoreo en tiempo real de inventario, proveedores y transacciones
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsVentaModalOpen(true)}
            className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-sm font-semibold px-4 py-2.5 rounded-xl transition shadow-lg shadow-cyan-500/20 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Registrar Venta
          </button>
        </div>
      </div>

      {/* Banner Interactivo de Numerito */}
      <div 
        onClick={onOpenChat}
        className="relative bg-gradient-to-r from-slate-900 via-slate-900 to-cyan-950/40 border border-slate-800 hover:border-cyan-500/40 rounded-2xl p-6 overflow-hidden flex items-center justify-between shadow-xl cursor-pointer transition-all group"
      >
        <div className="space-y-2 max-w-lg z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-medium">
            <Sparkles className="w-3.5 h-3.5" /> Asistente Inteligente
          </div>
          <h2 className="text-2xl font-bold text-slate-100 group-hover:text-cyan-300 transition-colors">
            Optimiza tu negocio con Numerito
          </h2>
          <p className="text-sm text-slate-400 leading-relaxed">
            Consulta en tiempo real el stock, análisis de margen de ganancia o recomendaciones sobre qué proveedores te convienen priorizar.
          </p>
        </div>

        <div className="relative w-56 h-52 shrink-0 flex items-center justify-center mr-12 hidden md:flex">
          <div className="absolute inset-0 bg-cyan-500/10 rounded-full blur-2xl group-hover:bg-cyan-500/20 transition-all" />
          <img
            src="/numerito.png"
            alt="Numerito AI Full"
            className="w-full h-full object-contain relative z-10 drop-shadow-[0_10px_20px_rgba(6,182,212,0.15)] scale-110 group-hover:scale-115 transition-transform"
          />
        </div>
      </div>

      {/* Tarjetas de Métricas Rápidas */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 animate-pulse">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 bg-slate-900/50 border border-slate-800 rounded-2xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Productos */}
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-cyan-500/10 text-cyan-400 rounded-xl">
                <Package className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wider">Productos</p>
                <h3 className="text-2xl font-bold">{stats?.total_productos || 0} Ítems</h3>
              </div>
            </div>
          </div>

          {/* Stock Crítico */}
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-rose-500/10 text-rose-400 rounded-xl">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wider">Stock Crítico</p>
                <h3 className="text-2xl font-bold text-rose-400">{stats?.stock_critico || 0} Ítems</h3>
              </div>
            </div>
          </div>

          {/* Ventas Recientes */}
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wider">Ventas (7d)</p>
                <h3 className="text-2xl font-bold text-emerald-400">${stats?.ventas_recientes || 0}</h3>
              </div>
            </div>
          </div>

          {/* Proveedores */}
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-500/10 text-purple-400 rounded-xl">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wider">Proveedores</p>
                <h3 className="text-2xl font-bold">{stats?.total_proveedores || 0} Activos</h3>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sección del Inventario de Productos */}
      <div className="space-y-4">
        <ProductosTable onOpenModal={() => alert("Función para crear producto próximamente disponible")} />
      </div>

      {/* Sección de Proveedores */}
      <div className="space-y-4">
        <ProveedoresList />
      </div>

      {/* Modal para Registrar Ventas */}
      <RegistrarVentaModal
        isOpen={isVentaModalOpen}
        onClose={() => setIsVentaModalOpen(false)}
        productos={productos}
        onVentaExitosa={cargarDatos}
      />
    </div>
  );
};