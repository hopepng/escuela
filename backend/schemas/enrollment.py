from pydantic import BaseModel
from typing import Optional
from enum import Enum

class StatusEnum(str, Enum):
    activo = "activo"
    inactivo = "inactivo"
    completado = "completado"

class EnrollmentCreate(BaseModel):
    course_id: int
    student_id: Optional[int] = None  # solo lo usa admin

class EnrollmentUpdate(BaseModel):
    status: StatusEnum

class EnrollmentResponse(BaseModel):
    id: int
    student_id: int
    course_id: int
    status: StatusEnum

    model_config = {"from_attributes": True}

class EnrollmentDetailResponse(BaseModel):
    id: int
    student_id: int
    course_id: int
    status: StatusEnum
    student: Optional[object] = None
    course: Optional[object] = None

    model_config = {"from_attributes": True}