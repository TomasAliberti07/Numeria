import pandas as pd
from app.database import get_connection

def obtener_resumen_stock() -> dict:
    """Obtiene un resumen cuantitativo del inventario para respuestas rápidas de alto nivel."""
    conn = get_connection()
    cursor = conn.cursor()
    
    # Resolvemos los totales en SQL sin traer toda la tabla
    cursor.execute("""
        SELECT 
            COUNT(p.id) as total_productos,
            SUM(p.stock_actual) as unidades_totales,
            SUM(p.stock_actual * p.precio_compra) as valor_total_inventario
        FROM productos p
    """)
    row = cursor.fetchone()
    conn.close()
    
    if not row:
        return {"total_productos": 0, "unidades_totales": 0, "valor_total_inventario": 0}

    return dict(row)

def obtener_productos_stock_bajo(umbral: int = 5) -> list:
    """Filtra y devuelve directo de la base de datos la lista de productos con stock crítico (menor o igual al umbral)."""
    conn = get_connection()
    cursor = conn.cursor()
    
    # Consulta directa a la DB resolviendo el margen en SQL
    cursor.execute("""
        SELECT 
            p.id, p.nombre, p.stock_actual, p.stock_minimo, p.precio_venta,
            pr.nombre AS proveedor
        FROM productos p
        LEFT JOIN proveedores pr ON p.proveedor_id = pr.id
        WHERE p.stock_actual <= ?
    """, (umbral,))
    
    productos = [dict(row) for row in cursor.fetchall()]
    conn.close()
    
    return productos

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
        "cantidad_transacciones": len(df)
    }