from fastapi import FastAPI
from fastapi.openapi.utils import get_openapi
from app.database import engine, Base
from app.routers import auth, quiz, question

app = FastAPI()

Base.metadata.create_all(bind=engine)

app.include_router(auth.router)
app.include_router(quiz.router)
app.include_router(question.router)


def custom_openapi():
    if app.openapi_schema:
        return app.openapi_schema
    openapi_schema = get_openapi(
        title="Synaq API",
        version="1.0.0",
        routes=app.routes,
    )
    openapi_schema["components"]["securitySchemas"] = {
        "bearerAuth": {
            "type": "http",
            "schema": "bearer",
            "bearerFormat": "JWT",
        }
    }

    app.openapi_schema = openapi_schema
    return app.openapi_schema

app.openapi = custom_openapi

@app.get("/")
async def root():
    return {"message": "Welcome to Synaq API"}