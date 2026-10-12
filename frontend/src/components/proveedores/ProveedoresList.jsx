import React, { useEffect, useState } from 'react';
import { getProveedores, createProveedor, updateProveedor, deleteProveedor } from '../../api/proveedores';
import { Plus, Users, Star, Phone, Mail, UserCheck, Search, Edit2, Trash2, X } from 'lucide-react';

export const ProveedoresList = () => {
  const [proveedores, setProveedores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Estados del Modal Embebido (Crear / Editar)
  const [showModal, setShowModal] = useState(false);
  const [proveedorAEditar, setProveedorAEditar] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    contacto: '',
    telefono: '',
    email: '',
    calificacion_calidad: 5,
  });

  const cargarProveedores = () => {
    setLoading(true);
    getProveedores()
      .then((data) => setProveedores(Array.isArray(data) ? data : []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    cargarProveedores();
  }, []);

  // Abrir modal para Crear
  const handleOpenCrear = () => {
    setProveedorAEditar(null);
    setFormData({ nombre: '', contacto: '', telefono: '', email: '', calificacion_calidad: 5 });
    setShowModal(true);
  };

  // Abrir modal para Modificar
  const handleOpenEditar = (prov) => {
    setProveedorAEditar(prov);
    setFormData({
      nombre: prov.nombre || '',
      contacto: prov.contacto || '',
      telefono: prov.telefono || '',
      email: prov.email || '',
      calificacion_calidad: prov.calificacion_calidad ?? 5,
    });
    setShowModal(true);
  };

  // Guardar (POST o PUT)
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (proveedorAEditar && proveedorAEditar.id) {
        await updateProveedor(proveedorAEditar.id, formData);
      } else {
        await createProveedor(formData);
      }
      setShowModal(false);
      cargarProveedores();
    } catch (err) {
      console.error('Error al guardar proveedor:', err);
      alert('No se pudo guardar el proveedor.');
    }
  };

  // Eliminar
  const handleDelete = async (id, nombre) => {
    if (!id) return;
    if (window.confirm(`¿Estás seguro de eliminar al proveedor "${nombre || 'Proveedor'}"?`)) {
      try {
        await deleteProveedor(id);
        setProveedores((prev) => prev.filter((p) => p.id !== id));
      } catch (error) {
        console.error('Error al eliminar proveedor:', error);
        alert('No se pudo eliminar el proveedor.');
      }
    }
  };

  // Filtrado reactivo
  const proveedoresFiltrados = proveedores.filter((prov) => {
    const term = searchTerm.toLowerCase();
    return (
      prov.nombre?.toLowerCase().includes(term) ||
      prov.contacto?.toLowerCase().includes(term) ||
      prov.email?.toLowerCase().includes(term)
    );
  });

  // Clase para inputs numéricos sin flechas
  const inputNumberStyle = "w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-sm text-slate-100 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition font-mono [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none";

  if (loading && proveedores.length === 0) {
    return (
      <div className="bg-slate-900 p-8 rounded-2xl border border-slate-800 text-center text-slate-400 font-mono text-sm">
        Cargando directorio de proveedores...
      </div>
    );
  }

  return (
    <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-xl space-y-4">
      {/* Encabezado, Búsqueda y Acciones */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-cyan-400" />
          <h2 className="text-xl font-bold text-slate-100">Gestión de Proveedores</h2>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          {/* Barra de Búsqueda */}
          <div className="relative flex-1 md:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Buscar proveedor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950/60 border border-slate-800 focus:border-cyan-500/50 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-100 placeholder-slate-500 outline-none transition"
            />
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleOpenCrear}
              className="flex items-center gap-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold px-4 py-2 rounded-xl text-sm transition shadow-lg shadow-cyan-500/10"
            >
              <Plus className="w-4 h-4" /> Nuevo Proveedor
            </button>
          </div>
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
              <th className="p-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80">
            {proveedoresFiltrados.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-6 text-center text-slate-500">
                  {searchTerm ? 'No se encontraron coincidencias.' : 'No hay proveedores registrados.'}
                </td>
              </tr>
            ) : (
              proveedoresFiltrados.map((prov) => (
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
                  <td className="p-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => handleOpenEditar(prov)}
                        className="p-1.5 text-slate-400 hover:text-cyan-400 hover:bg-slate-800 rounded-lg transition"
                        title="Modificar proveedor"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(prov.id, prov.nombre)}
                        className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition"
                        title="Eliminar proveedor"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Embebido para Crear o Modificar Proveedor */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-md text-slate-100 shadow-2xl relative">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
              <h3 className="text-lg font-bold text-white">
                {proveedorAEditar ? 'Modificar Proveedor' : 'Agregar Nuevo Proveedor'}
              </h3>
              <button 
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-200 p-1 rounded-lg hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Nombre / Empresa *</label>
                <input
                  type="text"
                  required
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-sm text-slate-100 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition"
                  placeholder="Ej. Distribuidora Central"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Persona de Contacto</label>
                <input
                  type="text"
                  value={formData.contacto}
                  onChange={(e) => setFormData({ ...formData, contacto: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-sm text-slate-100 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition"
                  placeholder="Ej. Carlos Pérez"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Teléfono</label>
                  <input
                    type="text"
                    value={formData.telefono}
                    onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
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
                    value={formData.calificacion_calidad}
                    onChange={(e) => setFormData({ ...formData, calificacion_calidad: parseInt(e.target.value) || 5 })}
                    onFocus={(e) => e.target.select()}
                    className={inputNumberStyle}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
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
                  {proveedorAEditar ? 'Guardar Cambios' : 'Guardar Proveedor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};