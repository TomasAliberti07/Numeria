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
    """)
    row = cursor.fetchone()
    conn.close()
    
    if not row:
        return {"total_productos": 0, "unidades_totales": 0, "valor_total_inventario": 0}

    # Compatibilidad garantizada tanto si row es Row como si es Tupla
    if hasattr(row, 'keys'):
        return dict(row)
    
    return {
        "total_productos": row[0] or 0,
        "unidades_totales": row[1] or 0,
        "valor_total_inventario": float(row[2] or 0)
    }

def obtener_productos_stock_bajo(umbral: int = 5) -> list:
    """Filtra y devuelve la lista de productos con stock crítico (menor o igual al umbral especificado)."""
    # Forzar conversión a entero por si Gemini pasa el umbral como string o float
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
        WHERE p.stock_actual <= ?
    """, (umbral_int,))
    
    rows = cursor.fetchall()
    conn.close()
    
    if not rows:
        return []

    # Verificar si las filas tienen acceso por clave o son tuplas
    if rows and hasattr(rows[0], 'keys'):
        return [dict(r) for r in rows]

    # Mapeo manual seguro en caso de tuplas SQLite
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