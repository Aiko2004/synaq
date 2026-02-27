from pydantic import BaseModel
from typing import Optional

class QuizCreate(BaseModel):
    title: str
    description: Optional[str] = None
    is_public: bool = False

class QuizUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    is_public: Optional[bool] = None

class QuizResponse(BaseModel):
    id: int
    title: str
    description: Optional[str]
    is_public: bool
    share_code: str
    owner_id: int

    class Config:
        from_attributes = True