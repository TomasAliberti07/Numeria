import pandas as pd
from app.database import get_connection

def obtener_resumen_stock() -> dict:
    """Obtiene un resumen cuantitativo del inventario para respuestas rápidas de alto nivel."""
    conn = get_connection()
    cursor = conn.cursor()
    
    cursor.execute("""
        SELECT 
            COUNT(p.id) as total_productos,
            COALESCE(SUM(p.stock_actual), 0) as unidades_totales,
            COALESCE(SUM(p.stock_actual * p.precio_compra), 0) as valor_total_inventario
        FROM productos p
        WHERE p.activo = 1
    """)
    row = cursor.fetchone()
    conn.close()
    
    if not row:
        return {"total_productos": 0, "unidades_totales": 0, "valor_total_inventario": 0}

    if hasattr(row, 'keys'):
        return dict(row)
    
    return {
        "total_productos": row[0] or 0,
        "unidades_totales": row[1] or 0,
        "valor_total_inventario": float(row[2] or 0)
    }

def obtener_productos_stock_bajo(umbral: int = 5) -> list:
    """Filtra y devuelve la lista de productos activos con stock crítico."""
    try:
        umbral_int = int(umbral)
    except (ValueError, TypeError):
        umbral_int = 5

    conn = get_connection()
    cursor = conn.cursor()
    
    cursor.execute("""
        SELECT 
            p.id, p.nombre, p.stock_actual, p.stock_minimo, p.precio_venta,
            pr.nombre AS proveedor
        FROM productos p
        LEFT JOIN proveedores pr ON p.proveedor_id = pr.id
        WHERE p.stock_actual <= ? AND p.activo = 1
    """, (umbral_int,))
    
    rows = cursor.fetchall()
    conn.close()
    
    if not rows:
        return []

    if rows and hasattr(rows[0], 'keys'):
        return [dict(r) for r in rows]

    resultado = []
    for r in rows:
        resultado.append({
            "id": r[0],
            "nombre": r[1],
            "stock_actual": r[2],
            "stock_minimo": r[3],
            "precio_venta": float(r[4]) if r[4] is not None else 0.0,
            "proveedor": r[5] or "Sin Proveedor"
        })
    return resultado

def obtener_reporte_ventas() -> dict:
    """Analiza las métricas clave de ventas históricas directamente desde la base de datos."""
    conn = get_connection()
    query = """
        SELECT 
            v.id, p.nombre AS producto, v.cantidad, 
            v.precio_unitario, (v.cantidad * v.precio_unitario) AS total_venta,
            v.fecha
        FROM ventas v
        JOIN productos p ON v.producto_id = p.id
    """
    df = pd.read_sql_query(query, conn)
    conn.close()

    if df.empty:
        return {"total_ventas": 0, "total_ingresos": 0, "producto_mas_vendido": "Sin registros"}

    return {
        "total_ingresos": float(df['total_venta'].sum()),
        "unidades_vendidas": int(df['cantidad'].sum()),
        "producto_mas_vendido": str(df.groupby('producto')['cantidad'].sum().idxmax()),
        "cantidad_transacciones": int(len(df))
    }

# ==========================================
# NUEVAS FUNCIONES PARA EL GLOSARIO SEGURO
# ==========================================

def obtener_productos_mas_caros(limite: int = 5) -> list:
    """Devuelve los productos activos con mayor precio de venta (ignora borrados lógicos)."""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT p.nombre, p.precio_venta, p.stock_actual, pr.nombre AS proveedor
        FROM productos p
        LEFT JOIN proveedores pr ON p.proveedor_id = pr.id
        WHERE p.activo = 1
        ORDER BY p.precio_venta DESC
        LIMIT ?
    """, (limite,))
    rows = cursor.fetchall()
    conn.close()
    
    return [{"nombre": r[0], "precio_venta": float(r[1]), "stock_actual": r[2], "proveedor": r[3] or "Sin Proveedor"} for r in rows]

def obtener_productos_sin_stock() -> list:
    """Devuelve los productos activos que tienen stock en 0."""
    return obtener_productos_stock_bajo(umbral=0)

def obtener_top_productos_vendidos(limite: int = 3) -> list:
    """Devuelve los productos con mayor cantidad total unidades vendidas."""
    conn = get_connection()
    query = """
        SELECT p.nombre, SUM(v.cantidad) as total_vendido
        FROM ventas v
        JOIN productos p ON v.producto_id = p.id
        GROUP BY p.id, p.nombre
        ORDER BY total_vendido DESC
        LIMIT ?
    """
    df = pd.read_sql_query(query, conn, params=(limite,))
    conn.close()
    
    if df.empty:
        return []
    
    return [{"producto": row["nombre"], "unidades_vendidas": int(row["total_vendido"])} for _, row in df.iterrows()]

def obtener_proveedor_mejor_calificado() -> dict:
    """Devuelve el proveedor con la calificación de calidad más alta."""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT nombre, contacto, telefono, email, calificacion_calidad
        FROM proveedores
        ORDER BY calificacion_calidad DESC, nombre ASC
        LIMIT 1
    """)
    row = cursor.fetchone()
    conn.close()
    
    if not row:
        return {"nombre": "Sin proveedores", "calificacion_calidad": 0}
        
    return {
        "nombre": row[0],
        "contacto": row[1] or "N/A",
        "telefono": row[2] or "N/A",
        "email": row[3] or "N/A",
        "calificacion_calidad": row[4]
    }

def obtener_lista_proveedores() -> list:
    """Devuelve todos los proveedores ordenados por calificación de calidad."""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT nombre, contacto, telefono, email, calificacion_calidad
        FROM proveedores
        ORDER BY calificacion_calidad DESC
    """)
    rows = cursor.fetchall()
    conn.close()
    
    return [{
        "nombre": r[0],
        "contacto": r[1] or "N/A",
        "telefono": r[2] or "N/A",
        "email": r[3] or "N/A",
        "calificacion_calidad": r[4]
    } for r in rows]