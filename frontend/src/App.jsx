import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { ChatDrawer } from './components/ChatDrawer';
import { ProductosTable } from './components/productos/ProductosTable';
import { AgregarProducto } from './components/productos/AgregarProducto'; // 👈 Importamos el modal de producto
import { ProveedoresList } from './components/proveedores/ProveedoresList';
import { getDashboardSummary } from './api/dashboard';
import { VentaTable } from './components/ventas/VentaTable';
import { RegistrarVentaModal } from './components/ventas/RegistrarVentaModal';
import { 
  Package, 
  TrendingUp, 
  Users, 
  AlertTriangle, 
  Sparkles, 
  LayoutDashboard, 
  ShoppingCart, 
  Truck, 
  Bot,
  RefreshCw 
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isChatOpen, setIsChatOpen] = useState(false);

  // Estados para Modales
  const [showVentaModal, setShowVentaModal] = useState(false);
  const [showProductoModal, setShowProductoModal] = useState(false); // 👈 Estado para modal de producto
  const [productos, setProductos] = useState([]);

  // Estados del Dashboard
  const [metrics, setMetrics] = useState({
    stock: { total_productos: 0, unidades_totales: 0, valor_total_inventario: 0 },
    ventas: { total_ingresos: 0, unidades_vendidas: 0, producto_mas_vendido: 'N/A', cantidad_transacciones: 0 },
    productos_criticos: []
  });
  const [loadingMetrics, setLoadingMetrics] = useState(true);

  const cargarMetricasDashboard = async () => {
    try {
      setLoadingMetrics(true);
      const data = await getDashboardSummary();
      setMetrics(data);
    } catch (error) {
      console.error("Error al cargar métricas del dashboard:", error);
    } finally {
      setLoadingMetrics(false);
    }
  };

  const cargarProductos = async () => {
    try {
      const apiUrl = import.meta.env?.VITE_API_URL || 'http://127.0.0.1:8000/api';
      const res = await axios.get(`${apiUrl}/productos`);
      setProductos(res.data);
    } catch (error) {
      console.error("Error al cargar productos para el selector:", error);
    }
  };

  useEffect(() => {
    cargarMetricasDashboard();
    cargarProductos();
  }, []);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'productos', label: 'Productos', icon: Package },
    { id: 'ventas', label: 'Ventas', icon: ShoppingCart },
    { id: 'proveedores', label: 'Proveedores', icon: Truck },
  ];

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden">
      {/* Sidebar de Navegación Lateral */}
      <aside className="w-64 bg-slate-900/60 border-r border-slate-800 flex flex-col justify-between shrink-0 p-4">
        <div className="space-y-6">
          {/* Logo Brand */}
          <div className="flex items-center gap-3 px-2">
            <div className="w-8 h-8 rounded-lg bg-cyan-500 flex items-center justify-center text-slate-950 font-bold text-lg shadow-lg shadow-cyan-500/20">
              N
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-slate-100 to-slate-400 bg-clip-text text-transparent">
              Numeria
            </h1>
          </div>

          {/* Menú de Opciones */}
          <nav className="space-y-1.5">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 shadow-sm'
                      : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Botón para abrir Numerito desde el Sidebar */}
        <button
          onClick={() => setIsChatOpen(true)}
          className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition shadow-lg shadow-cyan-500/20 text-sm"
        >
          <Bot className="w-4 h-4" /> Activar Numerito
        </button>
      </aside>

      {/* Contenido Principal */}
      <main className="flex-1 flex flex-col overflow-y-auto">
        {/* Navbar */}
        <header className="h-16 border-b border-slate-800 flex items-center justify-between px-8 bg-slate-900/40 shrink-0">
          <div className="text-sm font-medium text-slate-400">
            Módulo actual: <span className="text-slate-100 capitalize">{activeTab}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono bg-cyan-950 text-cyan-400 px-3 py-1.5 rounded-full border border-cyan-800 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" /> System Online
            </span>
          </div>
        </header>

        {/* Renderizado Condicional según Pestaña */}
        <div className="p-8 space-y-6 flex-1">
          {activeTab === 'dashboard' && (
            <>
              {/* Banner Interactivo con Numerito */}
              <div 
                onClick={() => setIsChatOpen(true)}
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
                    Haz clic aquí para consultar en tiempo real el stock, análisis de margen de ganancia o recomendaciones de proveedores.
                  </p>
                </div>

                <div className="relative w-56 h-52 shrink-0 flex items-center justify-center mr-12">
                  <div className="absolute inset-0 bg-cyan-500/10 rounded-full blur-2xl group-hover:bg-cyan-500/20 transition-all" />
                  <img
                    src="/numerito.png"
                    alt="Numerito AI Full"
                    className="w-full h-full object-contain relative z-10 drop-shadow-[0_10px_20px_rgba(6,182,212,0.15)] scale-110 group-hover:scale-115 transition-transform"
                  />
                </div>
              </div>

              {/* Métricas Rápidas */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-cyan-500/10 text-cyan-400 rounded-xl">
                      <Package className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 uppercase tracking-wider">Productos Totales</p>
                      <h3 className="text-2xl font-bold font-mono">
                        {loadingMetrics ? '...' : `${metrics.stock?.total_productos || 0} Ítems`}
                      </h3>
                    </div>
                  </div>
                  <span className="text-xs font-medium text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
                    {metrics.productos_criticos?.length || 0} Críticos
                  </span>
                </div>

                <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl">
                      <TrendingUp className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 uppercase tracking-wider">Ventas Acumuladas</p>
                      <h3 className="text-2xl font-bold font-mono">
                        {loadingMetrics ? '...' : `$${metrics.ventas?.total_ingresos?.toLocaleString() || 0}`}
                      </h3>
                    </div>
                  </div>
                  <span className="text-xs font-medium text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20 flex items-center gap-0.5">
                    {metrics.ventas?.cantidad_transacciones || 0} Op.
                  </span>
                </div>

                <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-purple-500/10 text-purple-400 rounded-xl">
                      <Users className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 uppercase tracking-wider">Valor Inventario</p>
                      <h3 className="text-2xl font-bold font-mono">
                        {loadingMetrics ? '...' : `$${metrics.stock?.valor_total_inventario?.toLocaleString() || 0}`}
                      </h3>
                    </div>
                  </div>
                  <button 
                    onClick={cargarMetricasDashboard}
                    className="p-1.5 text-slate-400 hover:text-cyan-400 hover:bg-slate-800 rounded-lg transition"
                    title="Actualizar métricas"
                  >
                    <RefreshCw className={`w-4 h-4 ${loadingMetrics ? 'animate-spin' : ''}`} />
                  </button>
                </div>
              </div>

              {/* Tabla Resumen */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
                <div className="p-6 border-b border-slate-800 flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-slate-100">Productos con Stock Crítico</h2>
                    <p className="text-xs text-slate-400">Listado de ítems con existencias por debajo o al nivel del umbral mínimo</p>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-slate-300">
                    <thead className="bg-slate-950/60 text-xs uppercase text-slate-400 border-b border-slate-800">
                      <tr>
                        <th className="px-6 py-3.5">ID</th>
                        <th className="px-6 py-3.5">Producto</th>
                        <th className="px-6 py-3.5">Stock Actual</th>
                        <th className="px-6 py-3.5">Stock Mínimo</th>
                        <th className="px-6 py-3.5">Precio Venta</th>
                        <th className="px-6 py-3.5">Proveedor</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {loadingMetrics ? (
                        <tr>
                          <td colSpan={6} className="px-6 py-8 text-center text-slate-500 font-mono text-xs">
                            Cargando productos desde la base de datos...
                          </td>
                        </tr>
                      ) : metrics.productos_criticos?.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                            No hay productos en estado crítico actualmente. ¡Stock óptimo!
                          </td>
                        </tr>
                      ) : (
                        metrics.productos_criticos.map((prod) => (
                          <tr key={prod.id} className="hover:bg-slate-800/40 transition-colors">
                            <td className="px-6 py-4 font-mono text-slate-500">#{prod.id}</td>
                            <td className="px-6 py-4 font-medium text-slate-100">{prod.nombre}</td>
                            <td className="px-6 py-4">
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20">
                                <AlertTriangle className="w-3 h-3" />
                                {prod.stock_actual} unidades
                              </span>
                            </td>
                            <td className="px-6 py-4 font-mono text-slate-400">{prod.stock_minimo} u.</td>
                            <td className="px-6 py-4 font-mono text-emerald-400">${prod.precio_venta?.toLocaleString()}</td>
                            <td className="px-6 py-4 text-slate-400">{prod.proveedor || 'N/A'}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {/* 1. PRODUCTOS CON MODAL CONECTADO */}
          {activeTab === 'productos' && (
            <>
              <ProductosTable onOpenModal={() => setShowProductoModal(true)} />
              <AgregarProducto
                isOpen={showProductoModal}
                onClose={() => setShowProductoModal(false)}
                onProductoAgregado={() => {
                  cargarProductos();
                  cargarMetricasDashboard();
                }}
              />
            </>
          )}

          {/* 2. VENTAS CON MODAL CONECTADO */}
          {activeTab === 'ventas' && (
            <>
              <VentaTable onOpenModal={() => setShowVentaModal(true)} />
              <RegistrarVentaModal
                isOpen={showVentaModal}
                onClose={() => setShowVentaModal(false)}
                productos={productos}
                onVentaExitosa={() => {
                  cargarMetricasDashboard();
                  cargarProductos();
                }}
              />
            </>
          )}

          {activeTab === 'proveedores' && (
            <ProveedoresList />
          )}
        </div>
      </main>

      {/* Drawer desplegable Chat */}
      <ChatDrawer isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
    </div>
  );
}