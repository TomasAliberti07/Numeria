from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter(prefix="/api/proveedores", tags=["Proveedores"])


class ProveedorSchema(BaseModel):
    nombre: str
    contacto: str | None = None
    telefono: str | None = None

@router.get("")
def listar_proveedores():
    # Aquí irá tu consulta a la base de datos
    return []

@router.post("")
def crear_proveedor(proveedor: ProveedorSchema):
    # Aquí guardarás el proveedor en la DB
    return {"mensaje": "Proveedor creado con éxito", "data": proveedor}