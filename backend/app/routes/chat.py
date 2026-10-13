from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.agent import responder_consulta
from app import analytics

router = APIRouter(prefix="/api/chat", tags=["Numerito Assistant & Glosario"])

class MensajeRequest(BaseModel):
    prompt: str

@router.post("/")
def chat_con_numerito(data: MensajeRequest):
    """Endpoint principal del chat con IA y reintentos / caché."""
    try:
        respuesta = responder_consulta(data.prompt)
        return {"respuesta": respuesta}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ==========================================
# ENDPOINTS DEL GLOSARIO SEGURO (Modo Base de Datos)
# ==========================================

@router.get("/glosario/stock-bajo")
def glosario_stock_bajo():
    """1. ¿Qué productos tienen stock bajo (menos de 5 unidades)?"""
    return {"data": analytics.obtener_productos_stock_bajo(5)}

@router.get("/glosario/resumen-inventario")
def glosario_resumen_inventario():
    """2. ¿Cuál es el valor total de mi inventario actual?"""
    return {"data": analytics.obtener_resumen_stock()}

@router.get("/glosario/productos-caros")
def glosario_productos_caros():
    """3. ¿Cuáles son los 5 productos más caros de mi catálogo?"""
    return {"data": analytics.obtener_productos_mas_caros(5)}

@router.get("/glosario/sin-stock")
def glosario_sin_stock():
    """4. Muéstrame todos los productos registrados sin stock (Stock 0)"""
    return {"data": analytics.obtener_productos_sin_stock()}

@router.get("/glosario/reporte-ventas")
def glosario_reporte_ventas():
    """5 y 7. Facturación total histórica y transacciones totales"""
    return {"data": analytics.obtener_reporte_ventas()}

@router.get("/glosario/top-ventas")
def glosario_top_ventas():
    """6. ¿Cuáles son los 3 productos más vendidos?"""
    return {"data": analytics.obtener_top_productos_vendidos(3)}

@router.get("/glosario/proveedor-destacado")
def glosario_proveedor_destacado():
    """8. ¿Quién es el proveedor mejor calificado?"""
    return {"data": analytics.obtener_proveedor_mejor_calificado()}

@router.get("/glosario/lista-proveedores")
def glosario_lista_proveedores():
    """9 y 10. Proveedores registrados, teléfonos y ordenados por calidad"""
    return {"data": analytics.obtener_lista_proveedores()}