from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session
from typing import List, Optional
import crud, schemas, database, ai_service

router = APIRouter(prefix="/api/ai/chat", tags=["chat"])

@router.get("/history", response_model=List[schemas.ChatHistoryItem])
def get_chat_history(db: Session = Depends(database.get_db)):
    return crud.get_sessions(db)

@router.post("/history", response_model=schemas.ChatSessionSchema)
def create_new_session(db: Session = Depends(database.get_db)):
    return crud.create_session(db, "New Chat")

@router.delete("/history/{session_id}")
def delete_chat_session(session_id: str, db: Session = Depends(database.get_db)):
    crud.delete_session(db, session_id)
    return {"status": "success"}

@router.get("/{session_id}/messages", response_model=List[schemas.ChatMessageSchema])
def get_session_messages(session_id: str, db: Session = Depends(database.get_db)):
    return crud.get_messages(db, session_id)

@router.post("/message")
def chat_with_ai(
    request: schemas.AIRequest, 
    db: Session = Depends(database.get_db),
    authorization: Optional[str] = Header(None)
):
    response = ai_service.ai_service.generate_ai_response(
        db=db,
        user_message=request.message,
        mode=request.mode,
        active_contexts=request.active_contexts,
        session_id=request.session_id,
        auth_token=authorization
    )
    if isinstance(response, str):
        raise HTTPException(status_code=500, detail=response)
    return response

@router.get("/prompts")
def get_quick_prompts():
    # These can be dynamic later, for now we can hardcode as per step-8.md requirement or UI state
    return [
        {"id": 1, "text": "Analisis cashflow & saran hemat"},
        {"id": 2, "text": "Review notes & insight penting"},
        {"id": 3, "text": "Draft ide project baru"},
    ]
