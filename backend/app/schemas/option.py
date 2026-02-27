from pydantic import BaseModel

class OptionCreate(BaseModel):
    text: str
    is_correct: bool = False

class OptionResponse(BaseModel):
    id: int
    text: str
    is_correct: bool

    class Config:
        from_attributes = True