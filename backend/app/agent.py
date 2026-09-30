import os
import time
from google import genai
from google.genai import types
from dotenv import load_dotenv
from app.analytics import obtener_resumen_stock, obtener_productos_stock_bajo, obtener_reporte_ventas

load_dotenv()

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

tools = [
    obtener_resumen_stock,
    obtener_productos_stock_bajo,
    obtener_reporte_ventas
]

SYSTEM_INSTRUCTION = """
Eres 'Numerito', un asistente experto en inventario, ventas y análisis de stock para la plataforma Numeria.
Tu objetivo es ayudar al usuario a entender el estado de su negocio con un tono profesional, claro y amigable.
Siempre que te pregunten sobre productos, stock, ventas o proveedores, utiliza las herramientas disponibles para consultar los datos reales antes de responder.
Si te hacen preguntas personales o ajenas al negocio, responde con amabilidad pero recuerda que tu único propósito es dar soporte sobre la gestión comercial de Numeria.
"""

def responder_consulta(mensaje_usuario: str) -> str:
    """Envía la consulta a Numerito controlando el consumo de cuota del plan gratuito."""
    try:
        chat = client.chats.create(
            model='gemini-3.8-flash',
            config=types.GenerateContentConfig(
                system_instruction=SYSTEM_INSTRUCTION,
                tools=tools,
                temperature=0.2
            )
        )
        response = chat.send_message(mensaje_usuario)
        
        if response.text:
            return response.text
            
        return "No pude procesar una respuesta precisa en este momento."

    except Exception as e:
        error_msg = str(e)
        print(f"[Error Numerito Agent]: {error_msg}")
        
        if "429" in error_msg or "RESOURCE_EXHAUSTED" in error_msg:
            return "Se alcanzó el límite de peticiones por minuto del plan gratuito (máximo 5 consultas por minuto). Por favor, aguardá unos 30 segundos antes de volver a preguntar."
        
        if "503" in error_msg or "UNAVAILABLE" in error_msg:
            return "Los servidores de la IA se encuentran saturados en este momento. Intentalo de nuevo en unos segundos."
            
        return "Ocurrió un error inesperado al conectar con el asistente de IA."