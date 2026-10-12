from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from app.database import get_connection

router = APIRouter(prefix="/api/ventas", tags=["Ventas"])

class VentaCreate(BaseModel):
    producto_id: int
    cantidad: int
    precio_unitario: float
    fecha: Optional[str] = None

class VentaUpdate(BaseModel):
    cantidad: Optional[int] = None
    precio_unitario: Optional[float] = None

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

@router.post("")
def registrar_venta(venta: VentaCreate):
    conn = get_connection()
    cursor = conn.cursor()
    
    # 1. Obtener el nombre del producto para cumplir con el campo NOT NULL en la tabla
    cursor.execute("SELECT nombre FROM productos WHERE id = ?", (venta.producto_id,))
    prod = cursor.fetchone()
    if not prod:
        conn.close()
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    
    nombre_producto = prod["nombre"]
    total_venta = venta.cantidad * venta.precio_unitario
    fecha_venta = venta.fecha or datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    # 2. Insertar la venta (incluyendo la columna 'producto' que exige tu tabla)
    cursor.execute("""
        INSERT INTO ventas (producto_id, producto, cantidad, precio_unitario, total_venta, fecha)
        VALUES (?, ?, ?, ?, ?, ?)
    """, (venta.producto_id, nombre_producto, venta.cantidad, venta.precio_unitario, total_venta, fecha_venta))

    # Opcional: Descontar stock automáticamente al vender
    cursor.execute("""
        UPDATE productos SET stock_actual = stock_actual - ? WHERE id = ?
    """, (venta.cantidad, venta.producto_id))

    conn.commit()
    venta_id = cursor.lastrowid
    conn.close()
    return {"id": venta_id, "mensaje": "Venta registrada con éxito"}

@router.put("/{venta_id}")
def actualizar_venta(venta_id: int, venta: VentaUpdate):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM ventas WHERE id = ?", (venta_id,))
    venta_actual = cursor.fetchone()
    if not venta_actual:
        conn.close()
        raise HTTPException(status_code=404, detail="Venta no encontrada")

    nueva_cantidad = venta.cantidad if venta.cantidad is not None else venta_actual["cantidad"]
    nuevo_precio = venta.precio_unitario if venta.precio_unitario is not None else venta_actual["precio_unitario"]
    nuevo_total = nueva_cantidad * nuevo_precio

    cursor.execute("""
        UPDATE ventas 
        SET cantidad = ?, precio_unitario = ?, total_venta = ?
        WHERE id = ?
    """, (nueva_cantidad, nuevo_precio, nuevo_total, venta_id))

    conn.commit()
    conn.close()
    return {"mensaje": "Venta actualizada con éxito"}

@router.delete("/{venta_id}")
def eliminar_venta(venta_id: int):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT id FROM ventas WHERE id = ?", (venta_id,))
    if not cursor.fetchone():
        conn.close()
        raise HTTPException(status_code=404, detail="Venta no encontrada")

    cursor.execute("DELETE FROM ventas WHERE id = ?", (venta_id,))
    conn.commit()
    conn.close()
    return {"mensaje": "Venta eliminada con éxito"}