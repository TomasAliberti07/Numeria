import sqlite3
import random
from datetime import datetime, timedelta

# Importamos la conexión oficial desde tu app/database.py
from app.database import get_db_connection

CATEGORIAS = ["Periféricos", "Monitores", "Almacenamiento", "Componentes", "Redes"]
PRODUCTOS_BASE = [
    "Teclado Mecánico RGB", "Mouse Inalámbrico", "Monitor 24 IPS", "Monitor 27 144Hz",
    "SSD NVMe 1TB", "Disco Rígido 2TB", "Memoria RAM 16GB", "Placa de Video RTX 3060",
    "Fuente 650W 80 Plus", "Gabinete Mid Tower", "Auriculares Gaming 7.1", "Webcam Full HD",
    "Router Wi-Fi 6", "Switch 8 Puertos", "Pad Mouse XL", "Silla Gamer Pro",
    "Micrófono Condensador", "Soporte Monitor Doble", "Placa de Red PCIe", "Cooler CPU Líquida"
]

PROVEEDORES_BASE = [
    ("Logitech Argentina", "Carlos Gómez", "11-4567-8901", "contacto@logitech.ar"),
    ("Samsung Distribuidora", "Mariana López", "11-2345-6789", "ventas@samsung-dist.com"),
    ("Kingston Direct", "Roberto Peña", "11-9876-5432", "rpena@kingston.com"),
    ("Redragon Wholesale", "Sofía Rossi", "11-3456-7890", "ventas@redragon.ar"),
    ("Asus Oficial Latam", "Diego Fernández", "11-8765-4321", "dfernandez@asus.com")
]

def poblar_base_datos():
    conn = get_db_connection()
    cursor = conn.cursor()

    print("🌱 Iniciando carga masiva de datos de prueba...")

    # 1. Insertar Proveedores (~10 registros)
    cursor.execute("DELETE FROM proveedores;")
    proveedores_ids = []
    
    for i in range(1, 11):
        nombre_base, contacto, tel, email = random.choice(PROVEEDORES_BASE)
        nombre = f"{nombre_base} #{i}" if i > 5 else nombre_base
        calificacion = random.randint(3, 5)
        
        cursor.execute("""
            INSERT INTO proveedores (nombre, contacto, telefono, email, calificacion_calidad)
            VALUES (?, ?, ?, ?, ?)
        """, (nombre, contacto, tel, email, calificacion))
        proveedores_ids.append(cursor.lastrowid)

    print(f"✅ {len(proveedores_ids)} Proveedores insertados.")

    # 2. Insertar Productos (50 registros)
    cursor.execute("DELETE FROM productos;")
    productos_creados = []

    for i in range(1, 51):
        nombre = f"{random.choice(PRODUCTOS_BASE)} - Mod. {random.randint(100, 999)}"
        categoria = random.choice(CATEGORIAS)
        
        case_stock = random.random()
        if case_stock < 0.15:
            stock_actual = 0  # Agotado
        elif case_stock < 0.35:
            stock_actual = random.randint(1, 4)  # Crítico
        else:
            stock_actual = random.randint(10, 80)  # Óptimo
            
        stock_minimo = 5
        precio_compra = round(random.uniform(15.0, 350.0), 2)
        precio_venta = round(precio_compra * random.uniform(1.3, 1.7), 2)
        proveedor_id = random.choice(proveedores_ids)

        cursor.execute("""
            INSERT INTO productos (nombre, categoria, stock_actual, stock_minimo, precio_compra, precio_venta, proveedor_id)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (nombre, categoria, stock_actual, stock_minimo, precio_compra, precio_venta, proveedor_id))
        
        productos_creados.append({
            "id": cursor.lastrowid,
            "nombre": nombre,
            "precio_venta": precio_venta
        })

    print("✅ 50 Productos insertados.")

    # 3. Insertar Ventas (50 registros)
    cursor.execute("DELETE FROM ventas;")
    
    for _ in range(50):
        prod = random.choice(productos_creados)
        cantidad = random.randint(1, 6)
        precio_unitario = prod["precio_venta"]
        total_venta = round(cantidad * precio_unitario, 2)
        
        dias_atras = random.randint(0, 30)
        fecha_venta = (datetime.now() - timedelta(days=dias_atras)).strftime("%Y-%m-%d %H:%M:%S")

        cursor.execute("""
            INSERT INTO ventas (producto_id, producto, cantidad, precio_unitario, total_venta, fecha)
            VALUES (?, ?, ?, ?, ?, ?)
        """, (prod["id"], prod["nombre"], cantidad, precio_unitario, total_venta, fecha_venta))

    print("✅ 50 Ventas registradas.")

    conn.commit()
    conn.close()
    print("\n🚀 ¡Base de datos poblada con éxito!")

if __name__ == "__main__":
    poblar_base_datos()