from sqlalchemy.orm import Session
import models, schemas
import uuid

def get_sessions(db: Session):
    return db.query(models.ChatSession).order_by(models.ChatSession.created_at.desc()).all()

def create_session(db: Session, title: str):
    db_session = models.ChatSession(id=str(uuid.uuid4()), title=title)
    db.add(db_session)
    db.commit()
    db.refresh(db_session)
    return db_session

def delete_session(db: Session, session_id: str):
    db_session = db.query(models.ChatSession).filter(models.ChatSession.id == session_id).first()
    if db_session:
        db.delete(db_session)
        db.commit()
    return db_session

def get_messages(db: Session, session_id: str):
    return db.query(models.ChatMessage).filter(models.ChatMessage.session_id == session_id).order_by(models.ChatMessage.created_at.asc()).all()

def add_message(db: Session, session_id: str, role: str, content: str):
    db_message = models.ChatMessage(
        id=str(uuid.uuid4()),
        session_id=session_id,
        role=role,
        content=content
    )
    db.add(db_message)
    db.commit()
    db.refresh(db_message)
    return db_message

def update_session_title(db: Session, session_id: str, title: str):
    db_session = db.query(models.ChatSession).filter(models.ChatSession.id == session_id).first()
    if db_session:
        db_session.title = title
        db.commit()
        db.refresh(db_session)
    return db_session
