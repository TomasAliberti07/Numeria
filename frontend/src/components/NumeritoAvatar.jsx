import React from 'react';

export const NumeritoAvatar = ({ cargando = false, size = "md" }) => {
  const dimensions = size === "lg" ? "w-12 h-12" : "w-10 h-10";

  return (
    <div className={`relative flex items-center justify-center ${dimensions} rounded-xl bg-slate-950 border border-cyan-500/40 shadow-lg shadow-cyan-500/20 overflow-hidden shrink-0`}>
      <img
        src="/numerito1.png"
        alt="Numerito Avatar"
        className={`w-full h-full object-cover ${cargando ? 'animate-pulse scale-110' : ''}`}
      />
      
      {/* LED de estado */}
      <span className="absolute bottom-0 right-0 flex h-2.5 w-2.5">
        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${cargando ? 'bg-amber-400' : 'bg-emerald-400'} opacity-75`} />
        <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${cargando ? 'bg-amber-500' : 'bg-emerald-500'} border border-slate-950`} />
      </span>
    </div>
  );
};