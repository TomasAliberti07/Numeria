from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from app.database import get_connection

router = APIRouter(prefix="/api/ventas", tags=["Ventas"])

class VentaCreate(BaseModel):
    producto_id: int
    cantidad: int
    precio_unitario: float
    fecha: Optional[str] = None

@router.get("")
def listar_ventas():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT v.*, p.nombre as producto_nombre, p.categoria 
        FROM ventas v
        LEFT JOIN productos p ON v.producto_id = p.id
        ORDER BY v.fecha DESC
    """)
    ventas = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return ventas