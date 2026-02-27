from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import secrets

from app.database import get_db
from app.models.user import User
from app.models.quiz import Quiz
from app.schemas.quiz import QuizCreate, QuizUpdate, QuizResponse
from app.core.security import get_current_user

router = APIRouter(prefix='/quizzes', tags=['quizzes'])

@router.post('/', response_model=QuizResponse)
def create_quiz(data: QuizCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    quiz = Quiz(
        title=data.title,
        description=data.description,
        is_public=data.is_public,
        owner_id=current_user.id,
        share_code=secrets.token_urlsafe(8)
    )
    db.add(quiz)
    db.commit()
    db.refresh(quiz)
    return quiz

@router.get("/", response_model=List[QuizResponse])
def get_quizzes(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    quizzes = db.query(Quiz).filter(Quiz.owner_id == current_user.id).all()
    return quizzes

@router.get("/{quiz_id}", response_model=QuizResponse)
def get_quiz(quiz_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    quiz = db.query(Quiz).filter(Quiz.id == quiz_id, Quiz.owner_id == current_user.id).first()
    if not quiz:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Тест не найден"
        )
    return quiz

@router.put("/{quiz_id}", response_model=QuizResponse)
def update_quiz(quiz_id: int, data: QuizUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    quiz = db.query(Quiz).filter(Quiz.id == quiz_id, Quiz.owner_id == current_user.id).first()
    if not quiz:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Тест не найден"
        )
    
    if data.title is not None:
        quiz.title = data.title
    if data.description is not None:
        quiz.description = data.description
    if data.is_public is not None:
        quiz.is_public = data.is_public

    db.commit()
    db.refresh(quiz)
    return quiz

@router.delete("/{quiz_id}")
def delete_quiz(quiz_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    quiz = db.query(Quiz).filter(Quiz.id == quiz_id, Quiz.owner_id == current_user.id).first()
    if not quiz:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Тест не найден"
        )
    
    db.delete(quiz)
    db.commit()
    return {"message": "Тест удалён"}