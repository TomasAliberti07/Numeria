from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from app.database import get_connection

router = APIRouter(prefix="/productos", tags=["Productos"])

class ProductoCreate(BaseModel):
    nombre: str
    categoria: str
    precio_compra: float
    precio_venta: float
    stock_actual: int
    stock_minimo: int = 5
    proveedor_id: Optional[int] = None

@router.get("/")
def listar_productos():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT p.*, pr.nombre as proveedor_nombre 
        FROM productos p
        LEFT JOIN proveedores pr ON p.proveedor_id = pr.id
    """)
    productos = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return productos

@router.post("/")
def crear_producto(prod: ProductoCreate):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO productos (nombre, categoria, precio_compra, precio_venta, stock_actual, stock_minimo, proveedor_id)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    """, (prod.nombre, prod.categoria, prod.precio_compra, prod.precio_venta, prod.stock_actual, prod.stock_minimo, prod.proveedor_id))
    conn.commit()
    prod_id = cursor.lastrowid
    conn.close()
    return {"id": prod_id, "mensaje": "Producto creado con éxito"}