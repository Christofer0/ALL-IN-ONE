from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional, Literal

class ChatMessageBase(BaseModel):
    role: Literal["user", "ai"]
    content: str

class ChatMessageCreate(ChatMessageBase):
    session_id: str

class ChatMessageSchema(ChatMessageBase):
    id: str
    created_at: datetime

    class Config:
        from_attributes = True

class ChatSessionBase(BaseModel):
    title: str

class ChatSessionCreate(ChatSessionBase):
    pass

class ChatSessionSchema(ChatSessionBase):
    id: str
    created_at: datetime
    messages: List[ChatMessageSchema] = []

    class Config:
        from_attributes = True

class ChatHistoryItem(BaseModel):
    id: str
    title: str
    created_at: datetime

class AIRequest(BaseModel):
    session_id: Optional[str] = None
    message: str
    mode: Literal["brainstorm", "review", "plan"] = "brainstorm"
    active_contexts: List[str] = []
