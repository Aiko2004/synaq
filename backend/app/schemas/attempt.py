from pydantic import BaseModel
from typing import List, Optional

class AnswerCreate(BaseModel):
    question_id: int
    option_id: Optional[int] = None
    text_answer: Optional[str] = None

class AttemptStart(BaseModel):
    user_name: str

class AttemptSubmit(BaseModel):
    user_name: str
    answers: List[AnswerCreate]

class AttemptResponse(BaseModel):
    id: int
    quiz_id: int
    user_name: str
    score: Optional[int] = None

    class Config:
        from_attributes = True