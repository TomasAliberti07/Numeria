import React, { useEffect, useState } from 'react';
import { getProveedores } from '../../api/proveedores';

export const ProveedoresList = () => {
  const [proveedores, setProveedores] = useState([]);

  useEffect(() => {
    getProveedores().then(setProveedores).catch(console.error);
  }, []);

  return (
    <div className="bg-slate-800 p-5 rounded-xl border border-slate-700 mt-6">
      <h2 className="text-xl font-bold text-white mb-4">Proveedores Registrados</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {proveedores.map((prov) => (
          <div key={prov.id} className="bg-slate-900/50 p-4 rounded-lg border border-slate-700">
            <h3 className="font-bold text-white text-lg">{prov.nombre}</h3>
            <p className="text-sm text-slate-400 mt-1">Contacto: {prov.contacto || 'N/A'}</p>
            <div className="flex justify-between items-center mt-3 text-xs text-slate-300">
              <span>Entrega: <strong>{prov.tiempo_entrega_dias} días</strong></span>
              <span className="bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded border border-amber-500/20">
                ★ {prov.calificacion_calidad} / 5
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};