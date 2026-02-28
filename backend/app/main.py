from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.openapi.utils import get_openapi
from app.database import engine, Base
from app.routers import auth, quiz, question, attempt, ws

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

Base.metadata.create_all(bind=engine)

app.include_router(auth.router)
app.include_router(quiz.router)
app.include_router(question.router)
app.include_router(attempt.router)
app.include_router(ws.router)

@app.get("/")
async def root():
    return {"message": "Welcome to Synaq API"}