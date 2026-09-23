import React from 'react';

export const Sidebar = ({ activeTab, setActiveTab, onOpenChat }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'productos', label: 'Productos', icon: '📦' },
    { id: 'ventas', label: 'Ventas', icon: '💰' },
    { id: 'proveedores', label: 'Proveedores', icon: '🚚' },
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between h-screen sticky top-0 p-4 text-white">
      <div>
        <div className="flex items-center gap-2 mb-8 px-2">
          <div className="w-8 h-8 bg-cyan-500 rounded-lg flex items-center justify-center font-bold text-slate-950">N</div>
          <span className="font-bold text-lg tracking-wide">Numeria</span>
        </div>

        <nav className="space-y-1">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === item.id
                  ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <span>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>
      </div>

      <button
        onClick={onOpenChat}
        className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold p-3 rounded-xl flex items-center justify-center gap-2 transition shadow-lg shadow-cyan-500/20"
      >
        <span>🤖</span> Chatear con Numerito
      </button>
    </aside>
  );
};