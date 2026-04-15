from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from models.course import Course
from models.user import User
from schemas.course import CourseCreate, CourseUpdate, CourseResponse
from schemas.user import UserResponse
from core.dependencies import get_current_user, require_roles

router = APIRouter(prefix="/courses", tags=["courses"])

@router.get("/", response_model=List[CourseResponse])
def list_courses(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    role = current_user.role.name
    if role == "admin":
        return db.query(Course).all()
    elif role == "profesor":
        return db.query(Course).filter(Course.teacher_id == current_user.id).all()
    else:
        return db.query(Course).all()

@router.get("/{course_id}", response_model=CourseResponse)
def get_course(
    course_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Curso no encontrado")
    if current_user.role.name == "profesor" and course.teacher_id != current_user.id:
        raise HTTPException(status_code=403, detail="No tienes acceso a este curso")
    return course

@router.get("/{course_id}/students", response_model=List[UserResponse])
def get_course_students(
    course_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Curso no encontrado")
    role = current_user.role.name
    if role == "profesor" and course.teacher_id != current_user.id:
        raise HTTPException(status_code=403, detail="No tienes acceso a este curso")
    if role == "estudiante":
        raise HTTPException(status_code=403, detail="Acceso denegado")
    students = [e.student for e in course.enrollments if e.student.role.name == "estudiante"]
    return students

@router.post("/", response_model=CourseResponse)
def create_course(
    body: CourseCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("admin"))
):
    if body.teacher_id:
        teacher = db.query(User).filter(User.id == body.teacher_id).first()
        if not teacher or teacher.role.name != "profesor":
            raise HTTPException(status_code=400, detail="El teacher_id debe ser un profesor válido")
    course = Course(**body.model_dump())
    db.add(course)
    db.commit()
    db.refresh(course)
    return course

@router.put("/{course_id}", response_model=CourseResponse)
def update_course(
    course_id: int,
    body: CourseUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("admin"))
):
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Curso no encontrado")
    if body.teacher_id:
        teacher = db.query(User).filter(User.id == body.teacher_id).first()
        if not teacher or teacher.role.name != "profesor":
            raise HTTPException(status_code=400, detail="El teacher_id debe ser un profesor válido")
    for field, value in body.model_dump(exclude_none=True).items():
        setattr(course, field, value)
    db.commit()
    db.refresh(course)
    return course

@router.delete("/{course_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_course(
    course_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("admin"))
):
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Curso no encontrado")
    db.delete(course)
    db.commit()