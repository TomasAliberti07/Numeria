from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from app.database import get_connection

router = APIRouter(prefix="/api/proveedores", tags=["Proveedores"])

class ProveedorSchema(BaseModel):
    nombre: str
    contacto: Optional[str] = None
    telefono: Optional[str] = None
    email: Optional[str] = None
    calificacion_calidad: Optional[int] = 5

@router.get("")
def listar_proveedores():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT id, nombre, contacto, telefono, email, calificacion_calidad 
        FROM proveedores
    """)
    proveedores = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return proveedores

@router.post("")
def crear_proveedor(prov: ProveedorSchema):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO proveedores (nombre, contacto, telefono, email, calificacion_calidad)
        VALUES (?, ?, ?, ?, ?)
    """, (prov.nombre, prov.contacto, prov.telefono, prov.email, prov.calificacion_calidad))
    conn.commit()
    prov_id = cursor.lastrowid
    conn.close()
    return {"id": prov_id, "mensaje": "Proveedor creado con éxito"}