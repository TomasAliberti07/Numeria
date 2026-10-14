import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Loader2, BookOpen, Sparkles, FileText, Download } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { descargarPDFReporte } from '../utils/pdfGenerator';
import { 
  enviarMensajeNumerito, 
  obtenerGlosarioStockBajo, 
  obtenerGlosarioResumenInventario,
  obtenerGlosarioProductosCaros,
  obtenerGlosarioSinStock,
  obtenerGlosarioReporteVentas,
  obtenerGlosarioTopVentas,
  obtenerGlosarioProveedorDestacado,
  obtenerGlosarioListaProveedores
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
      let textoRespuesta = `### 📌 Resultado (${tituloPregunta})\n\n`;
      
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

  const handlePdfClick = async (tipoReporte) => {
    if (isThinking) return;

    const userMsg = { id: Date.now(), sender: 'user', text: `Generar PDF de ${tipoReporte}` };
    setMessages((prev) => [...prev, userMsg]);
    setIsThinking(true);

    try {
      let datos = [];
      
      if (tipoReporte === 'Ventas') {
        datos = await obtenerGlosarioReporteVentas();
        if (!Array.isArray(datos)) datos = [datos];
      } else if (tipoReporte === 'Inventario') {
        datos = await obtenerGlosarioStockBajo();
      } else if (tipoReporte === 'Proveedores') {
        datos = await obtenerGlosarioListaProveedores();
      }

      // Llamada correcta a la función exportada en pdfGenerator.js
      descargarPDFReporte(tipoReporte, datos);

      // Obtener fecha actual para mostrarla amigablemente en el chat
      const hoy = new Date();
      const fechaStr = `${String(hoy.getDate()).padStart(2, '0')}-${String(hoy.getMonth() + 1).padStart(2, '0')}-${hoy.getFullYear()}`;
      const nombreArchivo = `${tipoReporte}-${fechaStr}.pdf`;

      const botMsg = {
        id: Date.now() + 1,
        sender: 'bot',
        text: `¡Aquí está el documento que solicitaste!\n\n📄 **${nombreArchivo}** se ha generado y descargado correctamente.`,
      };
      setMessages((prev) => [...prev, botMsg]);

    } catch (error) {
      console.error('Error al generar PDF:', error);
      setMessages((prev) => [...prev, { 
        id: Date.now() + 1, 
        sender: 'bot', 
        text: 'Ocurrió un error al obtener los datos para el PDF.' 
      }]);
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

        {/* Panel Desplegable del Glosario (10 Preguntas + PDFs) */}
        {showGlosario && (
          <div className="bg-slate-950/95 border-b border-slate-800 p-3 space-y-2 animate-fadeIn text-xs">
            <div className="flex items-center gap-1.5 text-cyan-400 font-semibold mb-1">
              <Sparkles className="w-3.5 h-3.5" /> Glosario y Reportes
            </div>
            <div className="grid grid-cols-1 gap-1.5 max-h-60 overflow-y-auto pr-1">
              
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">Inventario y Stock</div>
              <button onClick={(e) => { e.preventDefault(); handleGlosarioClick("¿Qué productos tienen stock bajo (< 5)?", obtenerGlosarioStockBajo); }} className="text-left bg-slate-900 hover:bg-slate-800 text-slate-300 p-2 rounded border border-slate-800 transition truncate">
                📦 1. Productos con stock bajo (&lt; 5 unidades)
              </button>
              <button onClick={(e) => { e.preventDefault(); handleGlosarioClick("¿Cuál es el valor total de mi inventario actual?", obtenerGlosarioResumenInventario); }} className="text-left bg-slate-900 hover:bg-slate-800 text-slate-300 p-2 rounded border border-slate-800 transition truncate">
                📊 2. Valor total del inventario actual
              </button>
              <button onClick={(e) => { e.preventDefault(); handleGlosarioClick("¿Cuáles son los 5 productos más caros de mi catálogo?", obtenerGlosarioProductosCaros); }} className="text-left bg-slate-900 hover:bg-slate-800 text-slate-300 p-2 rounded border border-slate-800 transition truncate">
                💎 3. Top 5 productos más caros
              </button>
              <button onClick={(e) => { e.preventDefault(); handleGlosarioClick("Muéstrame todos los productos registrados sin stock (Stock 0)", obtenerGlosarioSinStock); }} className="text-left bg-slate-900 hover:bg-slate-800 text-slate-300 p-2 rounded border border-slate-800 transition truncate">
                ❌ 4. Productos sin stock (0 unidades)
              </button>

              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">Ventas y Facturación</div>
              <button onClick={(e) => { e.preventDefault(); handleGlosarioClick("¿Cuál fue la facturación total histórica registrada?", obtenerGlosarioReporteVentas); }} className="text-left bg-slate-900 hover:bg-slate-800 text-slate-300 p-2 rounded border border-slate-800 transition truncate">
                💰 5. Facturación total histórica
              </button>
              <button onClick={(e) => { e.preventDefault(); handleGlosarioClick("¿Cuáles son los 3 productos más vendidos?", obtenerGlosarioTopVentas); }} className="text-left bg-slate-900 hover:bg-slate-800 text-slate-300 p-2 rounded border border-slate-800 transition truncate">
                🔥 6. Top 3 productos más vendidos
              </button>
              <button onClick={(e) => { e.preventDefault(); handleGlosarioClick("¿Cuántas transacciones de ventas se realizaron en total?", obtenerGlosarioReporteVentas); }} className="text-left bg-slate-900 hover:bg-slate-800 text-slate-300 p-2 rounded border border-slate-800 transition truncate">
                🧾 7. Cantidad de transacciones de ventas
              </button>

              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">Proveedores</div>
              <button onClick={(e) => { e.preventDefault(); handleGlosarioClick("¿Quién es el proveedor mejor calificado?", obtenerGlosarioProveedorDestacado); }} className="text-left bg-slate-900 hover:bg-slate-800 text-slate-300 p-2 rounded border border-slate-800 transition truncate">
                🤝 8. Proveedor mejor calificado
              </button>
              <button onClick={(e) => { e.preventDefault(); handleGlosarioClick("¿Qué proveedores tengo registrados y sus teléfonos de contacto?", obtenerGlosarioListaProveedores); }} className="text-left bg-slate-900 hover:bg-slate-800 text-slate-300 p-2 rounded border border-slate-800 transition truncate">
                📞 9. Agenda y teléfonos de proveedores
              </button>
              <button onClick={(e) => { e.preventDefault(); handleGlosarioClick("Lista los proveedores ordenados por su calificación de calidad", obtenerGlosarioListaProveedores); }} className="text-left bg-slate-900 hover:bg-slate-800 text-slate-300 p-2 rounded border border-slate-800 transition truncate">
                ⭐ 10. Proveedores ordenados por calidad
              </button>

              <div className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider mt-2 flex items-center gap-1">
                <FileText className="w-3 h-3" /> Generación de Reportes PDF
              </div>
              <button 
                onClick={(e) => { e.preventDefault(); handlePdfClick("Ventas"); }} 
                className="text-left bg-cyan-950/40 hover:bg-cyan-900/50 text-cyan-200 p-2 rounded border border-cyan-800/60 transition flex items-center justify-between w-full"
              >
                <span>📄 Descargar PDF de Ventas</span>
                <Download className="w-3.5 h-3.5" />
              </button>
              <button 
                onClick={(e) => { e.preventDefault(); handlePdfClick("Inventario"); }} 
                className="text-left bg-cyan-950/40 hover:bg-cyan-900/50 text-cyan-200 p-2 rounded border border-cyan-800/60 transition flex items-center justify-between w-full"
              >
                <span>📄 Descargar PDF de Inventario</span>
                <Download className="w-3.5 h-3.5" />
              </button>
              <button 
                onClick={(e) => { e.preventDefault(); handlePdfClick("Proveedores"); }} 
                className="text-left bg-cyan-950/40 hover:bg-cyan-900/50 text-cyan-200 p-2 rounded border border-cyan-800/60 transition flex items-center justify-between w-full"
              >
                <span>📄 Descargar PDF de Proveedores</span>
                <Download className="w-3.5 h-3.5" />
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