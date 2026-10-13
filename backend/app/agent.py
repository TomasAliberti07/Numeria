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

SYSTEM_INSTRUCTION = """
Eres 'Numerito', el asistente virtual de gestión de inventario y ventas para Numeria.
PAUTAS DE COMUNICACIÓN:
1. Sé amable, directo y profesional. Inicia con una breve frase de contexto antes de mostrar datos.
2. Presenta la información tabulada en Markdown con saltos de línea claros.
3. Si hay más de 8 registros, muestra los 8 más críticos y añade una nota explicativa al final.
"""

tools = [
    obtener_resumen_stock,
    obtener_productos_stock_bajo,
    obtener_reporte_ventas
]

MODELO = 'gemini-3.8-flash'

ia_cache = {}
CACHE_TTL_SEGUNDOS = 60

def limpiar_prompt(texto: str) -> str:
    return texto.strip().lower()

def crear_sesion_chat():
    logger.info(f"Inicializando sesión de chat con el modelo: {MODELO}")
    return client.chats.create(
        model=MODELO,
        config=types.GenerateContentConfig(
            system_instruction=SYSTEM_INSTRUCTION,
            tools=tools,
            temperature=0.2
        )
    )

chat = crear_sesion_chat()

def responder_consulta(mensaje_usuario: str, max_intentos: int = 2) -> str:
    global chat
    inicio_peticion = time.perf_counter()
    prompt_key = limpiar_prompt(mensaje_usuario)
    ahora = time.time()

    # 1. VERIFICAR CACHÉ
    if prompt_key in ia_cache:
        cached_data = ia_cache[prompt_key]
        if ahora - cached_data["timestamp"] < CACHE_TTL_SEGUNDOS:
            logger.info(f"[CACHE HIT] Respuesta devuelta desde caché para: '{mensaje_usuario}'")
            return cached_data["respuesta"]

    # 2. BUCLE DE REINTENTOS PARA 503
    for intento in range(max_intentos):
        intento_inicio = time.perf_counter()
        try:
            response = chat.send_message(mensaje_usuario)
            if response.text:
                texto_formateado = response.text.replace("\\n", "\n")
                ia_cache[prompt_key] = {"respuesta": texto_formateado, "timestamp": ahora}
                return texto_formateado
            return "No fue posible generar una respuesta para esta consulta."

        except ServerError as e:
            latencia_intento = round((time.perf_counter() - intento_inicio) * 1000, 2)
            if e.code == 503 and intento < max_intentos - 1:
                espera = 2.0 * (intento + 1)
                logger.warning(f"Google 503 en intento {intento + 1}. Reintentando en {espera}s...")
                time.sleep(espera)
                continue

            # Fallback a caché si existe
            if prompt_key in ia_cache:
                logger.warning("[FALLBACK CACHÉ] API caída por 503. Sirviendo datos en caché.")
                return ia_cache[prompt_key]["respuesta"]

            # MENSAJE AMIGABLE DE CORTAFUEGO QUE DISEÑASTE:
            logger.error(f"ServerError 503 persistente: {e}")
            return "Lo siento mucho pero en este momento no estoy pudiendo responder a esta pregunta. ¡Revisa el glosario de consultas que ahí no fallo!"

        except Exception as e:
            logger.error(f"Excepción inesperada: {e}")
            return f"Ocurrió un error al procesar la consulta: {str(e)}"

    return "Lo siento mucho pero en este momento no estoy pudiendo responder a esta pregunta. ¡Revisa el glosario de consultas que ahí no fallo!"