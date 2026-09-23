import pandas as pd
from app.database import get_connection

def obtener_resumen_stock():
    """Retorna una lista de diccionarios con el inventario actual y proveedores asociados."""
    conn = get_connection()
    query = """
        SELECT 
            p.id, p.nombre, p.categoria, p.stock_actual, 
            p.precio_compra, p.precio_venta,
            pr.nombre AS proveedor, pr.calificacion_calidad
        FROM productos p
        LEFT JOIN proveedores pr ON p.proveedor_id = pr.id
    """
    df = pd.read_sql_query(query, conn)
    conn.close()

    # Calcular margen de ganancia por producto usando Pandas
    df['margen_unitario'] = df['precio_venta'] - df['precio_compra']
    df['porcentaje_margen'] = ((df['margen_unitario'] / df['precio_compra']) * 100).round(2)
    
    # Convertimos a formato JSON-serializable para que la API de Gemini lo procese
    return df.to_dict(orient="records")

def obtener_productos_stock_bajo(umbral: int):
    """Filtra productos cuyo stock está igual o por debajo del umbral."""
    # Como obtener_resumen_stock() ahora devuelve lista de diccionarios, convertimos a DF para filtrar fácil
    productos = obtener_resumen_stock()
    df = pd.DataFrame(productos)
    
    if df.empty:
        return []

    df_bajo = df[df['stock_actual'] <= umbral]
    return df_bajo.to_dict(orient="records")

def obtener_reporte_ventas():
    """Analiza las ventas históricas y métricas clave."""
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
        return {"total_ventas": 0, "total_ingresos": 0, "producto_mas_vendido": "N/A"}

    # Análisis con Pandas
    resumen = {
        "total_ingresos": float(df['total_venta'].sum()),
        "unidades_vendidas": int(df['cantidad'].sum()),
        "producto_mas_vendido": str(df.groupby('producto')['cantidad'].sum().idxmax()),
        "ventas_recientes": df.to_dict(orient="records")
    }
    return resumen