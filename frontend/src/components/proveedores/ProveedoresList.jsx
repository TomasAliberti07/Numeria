import React, { useEffect, useState } from 'react';
import { getProveedores, createProveedor } from '../../api/proveedores';
import { Plus, RefreshCw, Users, Star, Phone, Mail, UserCheck } from 'lucide-react';

export const ProveedoresList = () => {
  const [proveedores, setProveedores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [nuevoProveedor, setNuevoProveedor] = useState({
    nombre: '',
    contacto: '',
    telefono: '',
    email: '',
    calificacion_calidad: 5
  });

  const cargarProveedores = () => {
    setLoading(true);
    getProveedores()
      .then(setProveedores)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    cargarProveedores();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createProveedor(nuevoProveedor);
      setShowModal(false);
      setNuevoProveedor({ nombre: '', contacto: '', telefono: '', email: '', calificacion_calidad: 5 });
      cargarProveedores();
    } catch (err) {
      console.error("Error al crear proveedor:", err);
    }
  };

  if (loading) {
    return (
      <div className="bg-slate-900 p-8 rounded-2xl border border-slate-800 text-center text-slate-400 font-mono text-sm">
        Cargando directorio de proveedores...
      </div>
    );
  }

  return (
    <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-xl">
      {/* Encabezado y Acciones */}
      <div className="flex justify-between items-center mb-5">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-cyan-400" />
          <h2 className="text-xl font-bold text-slate-100">Gestión de Proveedores</h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={cargarProveedores}
            className="p-2 text-slate-400 hover:text-cyan-400 hover:bg-slate-800 rounded-xl transition"
            title="Recargar proveedores"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold px-4 py-2 rounded-xl text-sm transition shadow-lg shadow-cyan-500/10"
          >
            <Plus className="w-4 h-4" /> Nuevo Proveedor
          </button>
        </div>
      </div>

      {/* Tabla de Proveedores */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-300">
          <thead className="bg-slate-950/60 text-slate-400 uppercase text-xs tracking-wider">
            <tr>
              <th className="p-3">ID</th>
              <th className="p-3">Proveedor / Empresa</th>
              <th className="p-3">Contacto</th>
              <th className="p-3">Teléfono</th>
              <th className="p-3">Email</th>
              <th className="p-3">Calificación</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80">
            {proveedores.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-6 text-center text-slate-500">
                  No hay proveedores registrados.
                </td>
              </tr>
            ) : (
              proveedores.map((prov) => (
                <tr key={prov.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="p-3 font-mono text-slate-500">#{prov.id}</td>
                  <td className="p-3 font-medium text-slate-100">{prov.nombre}</td>
                  <td className="p-3 text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <UserCheck className="w-3.5 h-3.5 text-slate-500" />
                      {prov.contacto || 'N/A'}
                    </span>
                  </td>
                  <td className="p-3 text-slate-300 font-mono text-xs">
                    {prov.telefono ? (
                      <span className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-slate-500" />
                        {prov.telefono}
                      </span>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td className="p-3 text-slate-300 font-mono text-xs">
                    {prov.email ? (
                      <span className="flex items-center gap-1.5 truncate max-w-[180px]">
                        <Mail className="w-3.5 h-3.5 text-slate-500" />
                        {prov.email}
                      </span>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td className="p-3">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      {prov.calificacion_calidad || 5} / 5
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal para Crear Proveedor */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-md text-slate-100 shadow-2xl">
            <h3 className="text-lg font-bold mb-4 text-white">Agregar Nuevo Proveedor</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Nombre / Empresa *</label>
                <input
                  type="text"
                  required
                  value={nuevoProveedor.nombre}
                  onChange={(e) => setNuevoProveedor({ ...nuevoProveedor, nombre: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-sm text-slate-100 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition"
                  placeholder="Ej. Distribuidora Central"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Persona de Contacto</label>
                <input
                  type="text"
                  value={nuevoProveedor.contacto}
                  onChange={(e) => setNuevoProveedor({ ...nuevoProveedor, contacto: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-sm text-slate-100 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition"
                  placeholder="Ej. Carlos Pérez"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Teléfono</label>
                  <input
                    type="text"
                    value={nuevoProveedor.telefono}
                    onChange={(e) => setNuevoProveedor({ ...nuevoProveedor, telefono: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-sm text-slate-100 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition font-mono"
                    placeholder="+54 11 ..."
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Calificación (1-5)</label>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    value={nuevoProveedor.calificacion_calidad}
                    onChange={(e) => setNuevoProveedor({ ...nuevoProveedor, calificacion_calidad: parseInt(e.target.value) || 5 })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-sm text-slate-100 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Email</label>
                <input
                  type="email"
                  value={nuevoProveedor.email}
                  onChange={(e) => setNuevoProveedor({ ...nuevoProveedor, email: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-sm text-slate-100 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition font-mono"
                  placeholder="contacto@empresa.com"
                />
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-sm hover:bg-slate-700 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-cyan-500 text-slate-950 font-semibold text-sm hover:bg-cyan-400 transition shadow-lg shadow-cyan-500/10"
                >
                  Guardar Proveedor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};