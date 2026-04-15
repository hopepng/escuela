from pydantic import BaseModel
from typing import Optional
from .user import UserResponse

class CourseCreate(BaseModel):
    title: str
    description: Optional[str] = None
    teacher_id: Optional[int] = None

class CourseUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    teacher_id: Optional[int] = None

class CourseResponse(BaseModel):
    id: int
    title: str
    description: Optional[str]
    teacher_id: Optional[int]
    teacher: Optional[UserResponse] = None

    model_config = {"from_attributes": True}