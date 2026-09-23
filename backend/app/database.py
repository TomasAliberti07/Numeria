import sqlite3
from datetime import datetime, timedelta

DB_NAME = "numeria.db"

def get_connection():
    """Retorna una conexión a la base de datos SQLite con Foreign Keys activadas."""
    conn = sqlite3.connect(DB_NAME)
    conn.row_factory = sqlite3.Row
    # Habilitar soporte para Foreign Keys en SQLite
    conn.execute("PRAGMA foreign_keys = ON;")
    return conn

def init_db():
    """Crea las tablas e inserta datos iniciales de prueba."""
    conn = get_connection()
    cursor = conn.cursor()

    # 1. Tabla Proveedores
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS proveedores (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nombre TEXT NOT NULL,
            contacto TEXT,
            calificacion_calidad REAL DEFAULT 5.0,
            tiempo_entrega_dias INTEGER DEFAULT 3,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
    """)

    # 2. Tabla Productos (agregamos stock_minimo)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS productos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nombre TEXT NOT NULL,
            categoria TEXT,
            precio_compra REAL NOT NULL,
            precio_venta REAL NOT NULL,
            stock_actual INTEGER NOT NULL DEFAULT 0,
            stock_minimo INTEGER NOT NULL DEFAULT 5,
            proveedor_id INTEGER,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (proveedor_id) REFERENCES proveedores (id) ON DELETE SET NULL
        )
    """)

    # 3. Tabla Ventas
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS ventas (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            producto_id INTEGER NOT NULL,
            cantidad INTEGER NOT NULL,
            precio_unitario REAL NOT NULL,
            total REAL NOT NULL,
            fecha TEXT NOT NULL,
            FOREIGN KEY (producto_id) REFERENCES productos (id) ON DELETE RESTRICT
        )
    """)

    # 4. Tabla de Trazabilidad / Auditoría de Numerito (Historial de consultas)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS interacciones_agente (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            pregunta_usuario TEXT NOT NULL,
            respuesta_agente TEXT NOT NULL,
            contexto_sql_usado TEXT,
            tokens_usados INTEGER,
            tiempo_respuesta_ms INTEGER,
            fecha TEXT DEFAULT CURRENT_TIMESTAMP
        )
    """)

    conn.commit()

    # Verificar si ya existen datos para no duplicar
    cursor.execute("SELECT COUNT(*) FROM proveedores")
    if cursor.fetchone()[0] == 0:
        _seed_data(conn)

    conn.close()

def _seed_data(conn):
    """Carga datos de prueba iniciales alineados al prototipo."""
    cursor = conn.cursor()

    # Proveedores (3 registros)
    proveedores = [
        ("TechSupply Co.", "contacto@techsupply.com", 4.5, 3),
        ("Global Import S.A.", "ventas@globalimport.com", 3.8, 7),
        ("Insumos Express", "soporte@insumosexpress.com", 4.9, 1)
    ]
    cursor.executemany("""
        INSERT INTO proveedores (nombre, contacto, calificacion_calidad, tiempo_entrega_dias)
        VALUES (?, ?, ?, ?)
    """, proveedores)

    # Productos (4 registros con stock_minimo)
    # Formato: (nombre, categoria, precio_compra, precio_venta, stock_actual, stock_minimo, proveedor_id)
    productos = [
        ("Teclado Mecánico RGB", "Periféricos", 45.0, 85.0, 24, 10, 1),
        ("Mouse Inalámbrico", "Periféricos", 10.0, 22.0, 5, 5, 3),
        ("Monitor 24 FHD", "Monitores", 110.0, 180.0, 8, 3, 2),
        ("Auriculares Bluetooth", "Audio", 18.0, 35.0, 2, 5, 1)
    ]
    cursor.executemany("""
        INSERT INTO productos (nombre, categoria, precio_compra, precio_venta, stock_actual, stock_minimo, proveedor_id)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    """, productos)

    # Ventas simulación (últimos 7 días)
    fechas = [(datetime.now() - timedelta(days=i)).strftime("%Y-%m-%d %H:%M:%S") for i in range(7)]
    
    # Formato: (producto_id, cantidad, precio_unitario, total, fecha)
    ventas = [
        (1, 2, 85.0, 170.0, fechas[0]),
        (2, 5, 22.0, 110.0, fechas[1]),
        (3, 1, 180.0, 180.0, fechas[2]),
        (1, 1, 85.0, 85.0, fechas[3]),
        (4, 2, 35.0, 70.0, fechas[4]),
        (2, 1, 22.0, 22.0, fechas[5])
    ]
    cursor.executemany("""
        INSERT INTO ventas (producto_id, cantidad, precio_unitario, total, fecha)
        VALUES (?, ?, ?, ?, ?)
    """, ventas)

    conn.commit()
    print("Base de datos Numeria inicializada y poblada con éxito.")

if __name__ == "__main__":
    init_db()