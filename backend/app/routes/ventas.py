from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter(prefix="/api/ventas", tags=["Ventas"])

# Esquema para recibir el payload del registro de venta desde el frontend
class VentaSchema(BaseModel):
    producto_id: int
    cantidad: int
    precio_total: float | None = None

@router.get("")
def listar_ventas():
    # Consulta de ventas realizadas
    return []

@router.post("")
def registrar_venta(venta: VentaSchema):
    # Procesa la venta y actualiza el stock correspondiente
    if venta.cantidad <= 0:
        raise HTTPException(status_code=400, detail="La cantidad debe ser mayor a 0")
    
    return {"mensaje": "Venta registrada con éxito", "data": venta}