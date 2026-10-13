import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Loader2, BookOpen, Sparkles } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { 
  enviarMensajeNumerito, 
  obtenerGlosarioStockBajo, 
  obtenerGlosarioResumenInventario,
  obtenerGlosarioReporteVentas,
  obtenerGlosarioTopVentas,
  obtenerGlosarioProveedorDestacado
} from '../api/chat';

export const ChatDrawer = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      text: '¡Hola! Soy Numerito. ¿Qué consulta querés hacer sobre el stock o las ventas?',
    },
  ]);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [showGlosario, setShowGlosario] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  if (!isOpen) return null;

  const handleSend = async (e) => {
    e.preventDefault();
    const cleanInput = input.trim();
    if (!cleanInput || isThinking) return;

    const userMsg = { id: Date.now(), sender: 'user', text: cleanInput };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsThinking(true);

    try {
      const data = await enviarMensajeNumerito(cleanInput);

      const botMsg = {
        id: Date.now() + 1,
        sender: 'bot',
        text: data.respuesta || 'Sin respuesta del servidor.',
      };
      setMessages((prev) => [...prev, botMsg]);

    } catch (error) {
      console.error('Error al conectar con Numerito:', error);
      const errorDetail =
        error.response?.data?.detail ||
        'Ocurrió un error al consultar a Numerito. Por favor, verifica que el backend esté corriendo.';

      const errorMsg = {
        id: Date.now() + 1,
        sender: 'bot',
        text: typeof errorDetail === 'string' ? errorDetail : JSON.stringify(errorDetail),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsThinking(false);
    }
  };

  const handleGlosarioClick = async (tituloPregunta, fetchFunction) => {
    if (isThinking) return;

    const userMsg = { id: Date.now(), sender: 'user', text: tituloPregunta };
    setMessages((prev) => [...prev, userMsg]);
    setIsThinking(true);

    try {
      const resultado = await fetchFunction();
      let textoRespuesta = `### 📌 Resultado del Glosario (${tituloPregunta})\n\n`;
      
      if (Array.isArray(resultado)) {
        if (resultado.length === 0) {
          textoRespuesta += "No se encontraron registros actualmente.";
        } else {
          const keys = Object.keys(resultado[0]);
          textoRespuesta += `| ${keys.join(' | ')} |\n`;
          textoRespuesta += `| ${keys.map(() => '---').join(' | ')} |\n`;
          resultado.forEach(item => {
            textoRespuesta += `| ${keys.map(k => item[k] ?? 'N/A').join(' | ')} |\n`;
          });
        }
      } else if (typeof resultado === 'object' && resultado !== null) {
        Object.entries(resultado).forEach(([key, val]) => {
          textoRespuesta += `- **${key.replace('_', ' ').toUpperCase()}**: ${val}\n`;
        });
      } else {
        textoRespuesta += `${resultado}`;
      }

      setMessages((prev) => [...prev, { id: Date.now() + 1, sender: 'bot', text: textoRespuesta }]);
    } catch (error) {
      setMessages((prev) => [...prev, { id: Date.now() + 1, sender: 'bot', text: 'Error al consultar el glosario local.' }]);
    } finally {
      setIsThinking(false);
      setShowGlosario(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/60 backdrop-blur-sm transition-opacity">
      <div className="w-full max-w-md bg-slate-900 border-l border-slate-800 h-full flex flex-col shadow-2xl">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-cyan-500/20 border border-cyan-500/40 p-1 flex items-center justify-center">
              <img src="/numerito1.png" alt="Numerito Avatar" className="w-full h-full object-contain" />
            </div>
            <div>
              <h3 className="font-bold text-slate-100 text-base leading-tight">Asistente Numerito</h3>
              <span className="text-[10px] text-cyan-400 font-mono">● Sistema activo</span>
            </div>
          </div>
          
          <div className="flex items-center gap-1">
            <button
              onClick={() => setShowGlosario(!showGlosario)}
              title="Glosario"
              className={`p-1.5 rounded-lg transition ${showGlosario ? 'bg-cyan-500/20 text-cyan-400' : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800'}`}
            >
              <BookOpen className="w-5 h-5" />
            </button>
            <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-lg transition">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Panel Desplegable del Glosario Limpio */}
        {showGlosario && (
          <div className="bg-slate-950/90 border-b border-slate-800 p-3 space-y-2 animate-fadeIn text-xs">
            <div className="flex items-center gap-1.5 text-cyan-400 font-semibold mb-1">
              <Sparkles className="w-3.5 h-3.5" /> Glosario
            </div>
            <div className="grid grid-cols-1 gap-1.5 max-h-48 overflow-y-auto pr-1">
              <button 
                onClick={() => handleGlosarioClick("¿Qué productos tienen stock bajo?", obtenerGlosarioStockBajo)}
                className="text-left bg-slate-900 hover:bg-slate-800 text-slate-300 p-2 rounded border border-slate-800 transition truncate"
              >
                📦 Ver productos con stock bajo (&lt; 5)
              </button>
              <button 
                onClick={() => handleGlosarioClick("¿Cuál es el resumen de inventario?", obtenerGlosarioResumenInventario)}
                className="text-left bg-slate-900 hover:bg-slate-800 text-slate-300 p-2 rounded border border-slate-800 transition truncate"
              >
                📊 Resumen total de inventario y valor
              </button>
              <button 
                onClick={() => handleGlosarioClick("¿Cuál es el reporte general de ventas?", obtenerGlosarioReporteVentas)}
                className="text-left bg-slate-900 hover:bg-slate-800 text-slate-300 p-2 rounded border border-slate-800 transition truncate"
              >
                💰 Facturación y transacciones totales
              </button>
              <button 
                onClick={() => handleGlosarioClick("¿Cuáles son los productos más vendidos?", obtenerGlosarioTopVentas)}
                className="text-left bg-slate-900 hover:bg-slate-800 text-slate-300 p-2 rounded border border-slate-800 transition truncate"
              >
                🔥 Top productos más vendidos
              </button>
              <button 
                onClick={() => handleGlosarioClick("¿Quién es el proveedor mejor calificado?", obtenerGlosarioProveedorDestacado)}
                className="text-left bg-slate-900 hover:bg-slate-800 text-slate-300 p-2 rounded border border-slate-800 transition truncate"
              >
                🤝 Proveedor mejor calificado
              </button>
            </div>
          </div>
        )}

        {/* Historial de Mensajes */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex items-start gap-3 ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              {msg.sender === 'bot' && (
                <div className="w-9 h-9 rounded-full bg-cyan-500/20 border border-cyan-500/30 p-1 shrink-0 flex items-center justify-center shadow-md">
                  <img src="/numerito1.png" alt="Numerito" className="w-full h-full object-contain" />
                </div>
              )}
              <div className={`max-w-[85%] p-3.5 rounded-2xl text-sm leading-relaxed overflow-x-auto ${
                msg.sender === 'user'
                  ? 'bg-cyan-500 text-slate-950 font-medium rounded-tr-none shadow-lg'
                  : 'bg-slate-800/80 text-slate-100 border border-slate-700/60 rounded-tl-none'
              }`}>
                {msg.sender === 'bot' ? (
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                      ul: ({ children }) => <ul className="list-disc pl-4 mb-2 space-y-1">{children}</ul>,
                      strong: ({ children }) => <strong className="font-semibold text-cyan-400">{children}</strong>,
                      table: ({ children }) => (
                        <div className="overflow-x-auto my-2 rounded-lg border border-slate-700">
                          <table className="min-w-full divide-y divide-slate-700 text-xs text-left">{children}</table>
                        </div>
                      ),
                      thead: ({ children }) => <thead className="bg-slate-900/80 text-slate-200">{children}</thead>,
                      tbody: ({ children }) => <tbody className="divide-y divide-slate-800 bg-slate-900/40">{children}</tbody>,
                      tr: ({ children }) => <tr>{children}</tr>,
                      th: ({ children }) => <th className="px-3 py-2 font-medium text-cyan-400">{children}</th>,
                      td: ({ children }) => <td className="px-3 py-2 text-slate-300">{children}</td>,
                    }}
                  >
                    {msg.text}
                  </ReactMarkdown>
                ) : (
                  msg.text
                )}
              </div>
            </div>
          ))}

          {isThinking && (
            <div className="flex items-center gap-2 text-xs text-cyan-400 italic font-mono pl-12">
              <Loader2 className="w-3.5 h-3.5 animate-spin" /> Numerito está procesando...
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Formulario de entrada */}
        <form onSubmit={handleSend} className="p-4 border-t border-slate-800 bg-slate-950/40 flex items-center gap-2">
          <input
            type="text"
            value={input}
            disabled={isThinking}
            onChange={(e) => setInput(e.target.value)}
            placeholder={isThinking ? "Aguardá la respuesta..." : "Escribí una consulta o usa el glosario..."}
            className="flex-1 bg-slate-900 border border-slate-800 focus:border-cyan-500/50 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 outline-none transition disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={isThinking || !input.trim()}
            className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 px-4 py-2.5 rounded-xl font-medium transition shadow-md flex items-center justify-center disabled:opacity-40"
          >
            {isThinking ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </form>
      </div>
    </div>
  );
};