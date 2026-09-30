from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from app.database import init_db
from app.analytics import obtener_resumen_stock, obtener_reporte_ventas
from app.agent import responder_consulta
from app.routes import productos, dashboard, proveedores, ventas, chat

# Definir el evento Lifespan moderno
@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield
    # Código que se ejecuta al APAGAR la API (si hiciera falta limpiar conexiones)

app = FastAPI(title="Numeria API", version="1.0.0", lifespan=lifespan)

# Habilitar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(productos.router)
app.include_router(dashboard.router)
app.include_router(proveedores.router)
app.include_router(ventas.router)
app.include_router(chat.router)