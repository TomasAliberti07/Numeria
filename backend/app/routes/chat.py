from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.agent import responder_consulta

router = APIRouter(prefix="/api/chat", tags=["Chatbot"])

class ChatRequest(BaseModel):
    message: str

class ChatResponse(BaseModel):
    response: str

@router.post("", response_model=ChatResponse)
def enviar_mensaje(payload: ChatRequest):
    if not payload.message.strip():
        raise HTTPException(status_code=400, detail="El mensaje no puede estar vacío.")
    
    try:
        # Llamada directa al agente de Gemini con Function Calling
        respuesta_ia = responder_consulta(payload.message)
        return ChatResponse(response=respuesta_ia)
    except Exception as e:
        print(f"[Error en Chat Route]: {e}")
        raise HTTPException(status_code=500, detail="Error interno al procesar la respuesta con el asistente.")