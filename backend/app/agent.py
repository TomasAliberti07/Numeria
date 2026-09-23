import os
from google import genai
from google.genai import types
from dotenv import load_dotenv
from app.analytics import obtener_resumen_stock, obtener_productos_stock_bajo, obtener_reporte_ventas

load_dotenv()

# Inicializar cliente de Gemini
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

# Definir herramientas disponibles para el agente
tools = [
    obtener_resumen_stock,
    obtener_productos_stock_bajo,
    obtener_reporte_ventas
]

SYSTEM_INSTRUCTION = """
Eres 'Numerito', un asistente experto en inventario, ventas y análisis de stock para la plataforma Numeria.
Tu objetivo es ayudar al usuario a entender el estado de su negocio con un tono profesional, claro y amigable.
Siempre que te pregunten sobre productos, stock, ventas o proveedores, utiliza las herramientas disponibles para consultar los datos reales antes de responder.
"""

def responder_consulta(mensaje_usuario: str) -> str:
    """Envía la consulta del usuario a Numerito y ejecuta las herramientas según sea necesario."""
    response = client.models.generate_content(
        model='gemini-3.6-flash',
        contents=mensaje_usuario,
        config=types.GenerateContentConfig(
            system_instruction=SYSTEM_INSTRUCTION,
            tools=tools,
            temperature=0.3
        )
    )
    return response.text