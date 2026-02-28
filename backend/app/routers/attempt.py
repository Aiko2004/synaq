from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime

from app.database import get_db
from app.models.quiz import Quiz
from app.models.question import Question
from app.models.option import Option
from app.models.attempt import Attempt
from app.models.answer import Answer
from app.schemas.attempt import AttemptStart, AttemptSubmit, AttemptResponse
from app.schemas.question import QuestionResponse
from app.schemas.quiz import QuizResponse
from app.core.redis import redis_client
from app.routers.ws import manager

router = APIRouter(prefix="/quiz", tags=["attempt"])

@router.get("/{share_code}", response_model=QuizResponse)
def get_public_quiz(share_code: str, db: Session = Depends(get_db)):
    quiz = db.query(Quiz).filter(Quiz.share_code == share_code).first()
    if not quiz:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Тест не найден"
        )
    
    return quiz

@router.post("/{share_code}/start", response_model=AttemptResponse)
async def start_quiz(share_code: str, data: AttemptStart, db: Session = Depends(get_db)):
    quiz = db.query(Quiz).filter(Quiz.share_code == share_code).first()
    if not quiz:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Тест не найден"
        )
    
    attempt = Attempt(
        quiz_id=quiz.id,
        user_name=data.user_name
    )
    db.add(attempt)
    db.commit()
    db.refresh(attempt)

    redis_client.rpush(f"quiz:{quiz.id}:participants", data.user_name)

    participants = redis_client.lrange(f"quiz:{quiz.id}:participants", 0, -1)
    await manager.broadcast(str(quiz.id), {
        "event": "update",
        "count": len(participants),
        "names": participants
    })

    return attempt

@router.post("/{share_code}/submit", response_model=AttemptResponse)
async def submit_quiz(share_code: str, data: AttemptSubmit, db: Session = Depends(get_db)):
    quiz = db.query(Quiz).filter(Quiz.share_code == share_code).first()
    if not quiz:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Тест не найден"
        )
    attempt = Attempt(
        quiz_id=quiz.id,
        user_name=data.user_name
    )
    db.add(attempt)
    db.flush()

    score = 0
    for answer_data in data.answers:
        answer = Answer(
            attempt_id=attempt.id,
            question_id=answer_data.question_id,
            option_id=answer_data.option_id,
            text_answer=answer_data.text_answer
        )
        db.add(answer)

        if answer_data.option_id:
            option = db.query(Option).filter(Option.id == answer_data.option_id).first()
            if option and option.is_correct:
                score += 1

    attempt.score = score
    attempt.finished_at = datetime.utcnow()

    db.commit()
    db.refresh(attempt)

    redis_client.lrem(f"quiz:{quiz.id}:participants", 0, data.user_name)

    participants = redis_client.lrange(f"quiz:{quiz.id}:participants", 0, -1)
    await manager.broadcast(str(quiz.id), {
        "event": "update",
        "count": len(participants),
        "names": participants
    })

    return attempt

