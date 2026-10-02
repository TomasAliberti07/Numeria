import os
import time
import logging
import traceback
from dotenv import load_dotenv
from google import genai
from google.genai import types
from google.genai.errors import ServerError

from app.analytics import (
    obtener_resumen_stock,
    obtener_productos_stock_bajo,
    obtener_reporte_ventas
)

# Configuración de Logging Estructurado
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] [NUMERITO-AGENT] %(message)s",
    datefmt="%H:%M:%S"
)
logger = logging.getLogger("NumeritoAgent")

load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    logger.critical("GEMINI_API_KEY no encontrada en el archivo .env")
    raise ValueError("GEMINI_API_KEY no encontrada en el archivo .env")

client = genai.Client(api_key=api_key)

# Prompt ajustado para balancear cordialidad, claridad y velocidad
SYSTEM_INSTRUCTION = """
Eres 'Numerito', el asistente virtual de gestión de inventario y ventas para Numeria.

PAUTAS DE COMUNICACIÓN:
1. Sé amable, directo y profesional. Inicia con una breve frase de contexto antes de mostrar datos (ejemplo: "Hola. Aquí tienes el listado de productos con stock bajo actualmente:").
2. Presenta la información tabulada en Markdown con saltos de línea claros entre cada fila.
   Ejemplo de formato:
   
   | Producto | Stock | Proveedor |
   | :--- | :---: | :--- |
   | Memoria RAM 16GB | 0 | Redragon Wholesale |

3. Si hay más de 8 registros en el reporte, muestra los 8 más críticos y añade una nota explicativa al final fuera de la tabla.
4. Evita modismos rebuscados o textos demasiado extensos.
"""

tools = [
    obtener_resumen_stock,
    obtener_productos_stock_bajo,
    obtener_reporte_ventas
]

MODELO = 'gemini-3.8-flash'


def crear_sesion_chat():
    """Inicializa la sesión de chat con el modelo oficial y la configuración definida."""
    logger.info(f"Inicializando sesión de chat con el modelo: {MODELO}")
    return client.chats.create(
        model=MODELO,
        config=types.GenerateContentConfig(
            system_instruction=SYSTEM_INSTRUCTION,
            tools=tools,
            temperature=0.2
        )
    )


# Instancia global de la sesión de chat
chat = crear_sesion_chat()


def responder_consulta(mensaje_usuario: str, max_intentos: int = 3) -> str:
    """
    Envía la consulta del usuario a Numerito con reintentos para 503
    y formateo adecuado para la interfaz visual.
    """
    global chat
    inicio_peticion = time.perf_counter()
    logger.info(f"Procesando consulta: '{mensaje_usuario}'")

    for intento in range(max_intentos):
        intento_inicio = time.perf_counter()
        try:
            response = chat.send_message(mensaje_usuario)
            
            duracion_total = round((time.perf_counter() - inicio_peticion) * 1000, 2)
            logger.info(f"Consulta resuelta en {duracion_total}ms (Intento {intento + 1}/{max_intentos})")

            if response.text:
                # Asegurar la correcta interpretación de los saltos de línea en Markdown
                texto_formateado = response.text.replace("\\n", "\n")
                return texto_formateado
            
            logger.warning("La respuesta de la API no contiene texto válido.")
            return "No fue posible generar una respuesta para esta consulta."

        except ServerError as e:
            latencia_intento = round((time.perf_counter() - intento_inicio) * 1000, 2)

            if e.code == 503 and intento < max_intentos - 1:
                espera = (intento + 1) * 0.5
                logger.warning(
                    f"Google 503 en intento {intento + 1}/{max_intentos} "
                    f"tras {latencia_intento}ms. Reintentando en {espera}s..."
                )
                time.sleep(espera)
                continue

            logger.error(f"ServerError {e.code} persistente tras {latencia_intento}ms: {e}")
            return "Los servidores de IA están experimentando alta demanda. Por favor, reintenta en un instante."

        except Exception as e:
            duracion_fallo = round((time.perf_counter() - inicio_peticion) * 1000, 2)
            logger.error(f"Excepción inesperada tras {duracion_fallo}ms: {e}")
            logger.debug(traceback.format_exc())
            return f"Ocurrió un error al procesar la consulta: {str(e)}"

    return "No fue posible conectar con el servicio tras varios intentos."