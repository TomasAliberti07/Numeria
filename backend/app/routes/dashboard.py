from fastapi import APIRouter
from app.analytics import obtener_resumen_stock, obtener_productos_stock_bajo, obtener_reporte_ventas

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])

@router.get("/summary")
def obtener_resumen_dashboard():
    return {
        "stock": obtener_resumen_stock(),
        "ventas": obtener_reporte_ventas(),
        "productos_criticos": obtener_productos_stock_bajo(umbral=5)
    }