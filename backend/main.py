from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import Base, engine
from routers import auth, users, courses, enrollments

Base.metadata.create_all(bind=engine)

app = FastAPI(title="SPA Backend API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4200"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(users.router)
app.include_router(courses.router)
app.include_router(enrollments.router)

@app.get("/")
def root():
    return {"message": "API funcionando", "docs": "/docs"}