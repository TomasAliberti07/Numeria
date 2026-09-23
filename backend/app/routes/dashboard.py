from fastapi import APIRouter
from app.database import get_connection

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

@router.get("/stats")
def obtener_metricas():
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT COUNT(*) FROM productos")
    total_productos = cursor.fetchone()[0]

    cursor.execute("SELECT COUNT(*) FROM productos WHERE stock_actual <= stock_minimo")
    stock_critico = cursor.fetchone()[0]

    cursor.execute("SELECT COALESCE(SUM(total), 0) FROM ventas WHERE fecha >= datetime('now', '-7 days')")
    ventas_recientes = cursor.fetchone()[0]

    cursor.execute("SELECT COUNT(*) FROM proveedores")
    total_proveedores = cursor.fetchone()[0]

    conn.close()

    return {
        "total_productos": total_productos,
        "stock_critico": stock_critico,
        "ventas_recientes": ventas_recientes,
        "total_proveedores": total_proveedores
    }