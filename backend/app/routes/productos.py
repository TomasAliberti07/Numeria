from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from app.database import get_connection

router = APIRouter(prefix="/api/productos", tags=["Productos"])

# Schemas Pydantic
class ProductoCreate(BaseModel):
    nombre: str
    categoria: str
    precio_compra: float
    precio_venta: float
    stock_actual: int
    stock_minimo: int = 5
    proveedor_id: Optional[int] = None

class ProductoUpdate(BaseModel):
    nombre: Optional[str] = None
    categoria: Optional[str] = None
    precio_compra: Optional[float] = None
    precio_venta: Optional[float] = None
    stock_actual: Optional[int] = None
    stock_minimo: Optional[int] = None
    proveedor_id: Optional[int] = None


@router.get("")
def listar_productos():
    conn = get_connection()
    cursor = conn.cursor()
    # Filtrar solo productos con is_active = 1
    cursor.execute("""
        SELECT p.*, pr.nombre as proveedor_nombre 
        FROM productos p
        LEFT JOIN proveedores pr ON p.proveedor_id = pr.id
        WHERE p.is_active = 1 OR p.is_active IS NULL
    """)
    productos = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return productos


@router.post("")
def crear_producto(prod: ProductoCreate):
    conn = get_connection()
    cursor = conn.cursor()
    
    # Si proveedor_id viene en 0 o inválido desde el frontend, guardarlo como None
    prov_id = prod.proveedor_id if prod.proveedor_id and prod.proveedor_id > 0 else None

    cursor.execute("""
        INSERT INTO productos (nombre, categoria, precio_compra, precio_venta, stock_actual, stock_minimo, proveedor_id, is_active)
        VALUES (?, ?, ?, ?, ?, ?, ?, 1)
    """, (prod.nombre, prod.categoria, prod.precio_compra, prod.precio_venta, prod.stock_actual, prod.stock_minimo, prov_id))
    
    conn.commit()
    prod_id = cursor.lastrowid
    conn.close()
    return {"id": prod_id, "mensaje": "Producto creado con éxito"}


@router.put("/{producto_id}")
def actualizar_producto(producto_id: int, prod: ProductoUpdate):
    conn = get_connection()
    cursor = conn.cursor()
    
    # Verificar si el producto existe
    cursor.execute("SELECT * FROM productos WHERE id = ?", (producto_id,))
    producto_existente = cursor.fetchone()
    if not producto_existente:
        conn.close()
        raise HTTPException(status_code=404, detail="Producto no encontrado")

    prov_id = prod.proveedor_id if prod.proveedor_id and prod.proveedor_id > 0 else None

    cursor.execute("""
        UPDATE productos 
        SET nombre = COALESCE(?, nombre),
            categoria = COALESCE(?, categoria),
            precio_compra = COALESCE(?, precio_compra),
            precio_venta = COALESCE(?, precio_venta),
            stock_actual = COALESCE(?, stock_actual),
            stock_minimo = COALESCE(?, stock_minimo),
            proveedor_id = COALESCE(?, proveedor_id)
        WHERE id = ?
    """, (prod.nombre, prod.categoria, prod.precio_compra, prod.precio_venta, prod.stock_actual, prod.stock_minimo, prov_id, producto_id))

    conn.commit()
    conn.close()
    return {"mensaje": "Producto actualizado con éxito"}


@router.delete("/{producto_id}")
def borrar_logico_producto(producto_id: int):
    conn = get_connection()
    cursor = conn.cursor()
    
    cursor.execute("SELECT id FROM productos WHERE id = ?", (producto_id,))
    if not cursor.fetchone():
        conn.close()
        raise HTTPException(status_code=404, detail="Producto no encontrado")

    # Borrado lógico: se marca is_active = 0 en lugar de hacer DELETE
    cursor.execute("UPDATE productos SET is_active = 0 WHERE id = ?", (producto_id,))
    conn.commit()
    conn.close()
    return {"mensaje": "Producto eliminado (inactivado) con éxito"}