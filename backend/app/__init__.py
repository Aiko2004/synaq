from app.models.user import User
from app.models.quiz import Quiz
from app.models.question import Question
from app.models.option import Option
from app.models.attempt import Attempt
from app.models.answer import Answer


if __name__ == '__main__':
    uvicorn.run(app,
                host='127.0.0.1',
                port=80,
                reload=True)