from pydantic import BaseModel
from typing import Optional, List
from app.schemas.option import OptionCreate, OptionResponse

class QuestionCreate(BaseModel):
    text: str
    type: str
    order_index: int = 0
    options: List[OptionCreate] = []
    
class QuestionUpdate(BaseModel):
    text: Optional[str] = None
    type: Optional[str] = None
    order_index: Optional[int] = None

class QuestionResponse(BaseModel):
    id: int
    text: str
    type: str
    order_index: int
    options: List[OptionResponse] = []

    class Config:
        from_attributes = True