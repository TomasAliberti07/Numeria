import React, { useState } from 'react';
import { ChatDrawer } from './components/ChatDrawer';
import { ProductosTable } from './components/productos/ProductosTable';
import { ProveedoresList } from './components/proveedores/ProveedoresList';
import { 
  Package, 
  TrendingUp, 
  Users, 
  AlertTriangle, 
  ArrowUpRight, 
  Sparkles, 
  LayoutDashboard, 
  ShoppingCart, 
  Truck, 
  Bot 
} from 'lucide-react';

const PRODUCTOS_MOCK = [
  { id: 1, nombre: 'Auriculares Bluetooth', categoria: 'Audio', stock: 2, precioCompra: 18, precioVenta: 35, proveedor: 'TechSupply Co.' },
  { id: 2, nombre: 'Mouse Inalámbrico', categoria: 'Periféricos', stock: 5, precioCompra: 10, precioVenta: 22, proveedor: 'Insumos Express' },
  { id: 3, nombre: 'Monitor 24 FHD', categoria: 'Monitores', stock: 8, precioCompra: 110, precioVenta: 180, proveedor: 'Global Import S.A.' },
  { id: 4, nombre: 'Teclado Mecánico RGB', categoria: 'Periféricos', stock: 24, precioCompra: 45, precioVenta: 85, proveedor: 'TechSupply Co.' },
];

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isChatOpen, setIsChatOpen] = useState(false);

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

              {/* Métricas rápidas */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-cyan-500/10 text-cyan-400 rounded-xl">
                      <Package className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 uppercase tracking-wider">Productos Totales</p>
                      <h3 className="text-2xl font-bold">4 Ítems</h3>
                    </div>
                  </div>
                  <span className="text-xs font-medium text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
                    3 Críticos
                  </span>
                </div>

                <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl">
                      <TrendingUp className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 uppercase tracking-wider">Ventas Recientes</p>
                      <h3 className="text-2xl font-bold">$237.00</h3>
                    </div>
                  </div>
                  <span className="text-xs font-medium text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20 flex items-center gap-0.5">
                    +12% <ArrowUpRight className="w-3 h-3" />
                  </span>
                </div>

                <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-purple-500/10 text-purple-400 rounded-xl">
                      <Users className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 uppercase tracking-wider">Proveedores</p>
                      <h3 className="text-2xl font-bold">3 Activos</h3>
                    </div>
                  </div>
                  <span className="text-xs font-medium text-purple-400 bg-purple-500/10 px-2.5 py-1 rounded-full border border-purple-500/20">
                    100% Calificados
                  </span>
                </div>
              </div>

              {/* Tabla Resumen de Inventario */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
                <div className="p-6 border-b border-slate-800 flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-slate-100">Estado del Inventario</h2>
                    <p className="text-xs text-slate-400">Resumen detallado de existencias y precios de venta</p>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-slate-300">
                    <thead className="bg-slate-950/60 text-xs uppercase text-slate-400 border-b border-slate-800">
                      <tr>
                        <th className="px-6 py-3.5">Producto</th>
                        <th className="px-6 py-3.5">Categoría</th>
                        <th className="px-6 py-3.5">Stock</th>
                        <th className="px-6 py-3.5">Precio Venta</th>
                        <th className="px-6 py-3.5">Proveedor</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {PRODUCTOS_MOCK.map((prod) => (
                        <tr key={prod.id} className="hover:bg-slate-800/40 transition-colors">
                          <td className="px-6 py-4 font-medium text-slate-100">{prod.nombre}</td>
                          <td className="px-6 py-4 text-slate-400">{prod.categoria}</td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                              prod.stock <= 5 
                                ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' 
                                : prod.stock <= 10 
                                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' 
                                : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            }`}>
                              {prod.stock <= 5 && <AlertTriangle className="w-3 h-3" />}
                              {prod.stock} unidades
                            </span>
                          </td>
                          <td className="px-6 py-4 text-slate-200">${prod.precioVenta}</td>
                          <td className="px-6 py-4 text-slate-400">{prod.proveedor}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {activeTab === 'productos' && (
            <ProductosTable onOpenModal={() => {}} />
          )}

          {activeTab === 'ventas' && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <h2 className="text-xl font-bold mb-2">Histórico de Ventas</h2>
              <p className="text-slate-400 text-sm">Próximamente registro filtrable de transacciones.</p>
            </div>
          )}

          {activeTab === 'proveedores' && (
            <ProveedoresList />
          )}
        </div>
      </main>

      {/* Drawer desplegable para el Chat con Numerito */}
      <ChatDrawer isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
    </div>
  );
}