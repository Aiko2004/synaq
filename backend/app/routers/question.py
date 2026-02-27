from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models.user import User
from app.models.quiz import Quiz
from app.models.question import Question
from app.models.option import Option
from app.schemas.question import QuestionCreate, QuestionUpdate, QuestionResponse
from app.core.security import get_current_user

router = APIRouter(prefix='/quizzes', tags=["questions"])

@router.post("/{quiz_id}/questions", response_model=QuestionResponse)
def create_question(quiz_id: int, data: QuestionCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    quiz = db.query(Quiz).filter(Quiz.id == quiz_id, Quiz.owner_id == current_user.id).first()
    if not quiz:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Тест не найден"
        )
    
    question = Question(
        quiz_id=quiz_id,
        text=data.text,
        type=data.type,
        order_index=data.order_index
    )
    db.add(question)
    db.flush()

    for option_data in data.options:
        option = Option(
            question_id=question.id,
            text=option_data.text,
            is_correct=option_data.is_correct
        )
        db.add(option)

    db.commit()
    db.refresh(question)
    return question


@router.get("/{quiz_id}/questions", response_model=List[QuestionResponse])
def get_questions(quiz_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    quiz = db.query(Quiz).filter(Quiz.id == quiz_id, Quiz.owner_id == current_user.id).first()
    if not quiz:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Тест не найден"
        )
    
    questions = db.query(Question).filter(Question.quiz_id == quiz_id).all()
    return questions

@router.put("/{quiz_id}/questions/{question_id}")
def update_question(quiz_id: int, question_id: int, data: QuestionUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    quiz = db.query(Quiz).filter(Quiz.id == quiz_id, Quiz.owner_id == current_user.id).first()
    if not quiz:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Тест не найден"
        )
    
    question = db.query(Question).filter(Question.id == question_id, Question.quiz_id == quiz_id).first()
    if not question:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Вопрос не найден"
        )
    
    if data.text is not None:
        question.text = data.text
    if data.type is not None:
        question.type = data.type
    if data.order_index is not None:
        question.order_index = data.order_index

    db.commit()
    db.refresh(question)

    return question

@router.delete("/{quiz_id}/questions/{question_id}")
def delete_question(quiz_id: int, question_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    quiz = db.query(Quiz).filter(Quiz.id == quiz_id, Quiz.owner_id == current_user.id).first()
    if not quiz:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Тест не найден"
        )
    
    question = db.query(Question).filter(Question.id == question_id, Question.quiz_id == quiz_id).first()
    if not question:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Вопрос не найден"
        )
    
    db.delete(question)
    db.commit()
    return {"message": 'Вопрос удален'}