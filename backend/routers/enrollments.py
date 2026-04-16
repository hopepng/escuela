from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from models.enrollment import Enrollment
from models.course import Course
from models.user import User
from schemas.enrollment import EnrollmentCreate, EnrollmentUpdate, EnrollmentResponse
from core.dependencies import get_current_user, require_roles

router = APIRouter(prefix="/enrollments", tags=["enrollments"])

@router.get("/", response_model=List[EnrollmentResponse])
def list_enrollments(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    role = current_user.role.name
    if role == "admin":
        return db.query(Enrollment).all()
    elif role == "estudiante":
        return db.query(Enrollment).filter(Enrollment.student_id == current_user.id).all()
    raise HTTPException(status_code=403, detail="Acceso denegado")

@router.post("/", response_model=EnrollmentResponse)
def create_enrollment(
    body: EnrollmentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    role = current_user.role.name

    if role not in ["admin", "estudiante"]:
        raise HTTPException(status_code=403, detail="Acceso denegado")

    # Determinar student_id según rol
    if role == "estudiante":
        student_id = current_user.id
    elif role == "admin":
        if not body.student_id:
            raise HTTPException(status_code=400, detail="Admin debe especificar student_id")
        # Verificar que el student_id sea un estudiante válido
        student = db.query(User).filter(User.id == body.student_id).first()
        if not student or student.role.name != "estudiante":
            raise HTTPException(status_code=400, detail="El student_id debe ser un estudiante válido")
        student_id = body.student_id

    # Verificar que el curso existe
    course = db.query(Course).filter(Course.id == body.course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Curso no encontrado")

    # Verificar matrícula duplicada
    existing = db.query(Enrollment).filter(
        Enrollment.student_id == student_id,
        Enrollment.course_id == body.course_id
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="El estudiante ya está matriculado en este curso")

    enrollment = Enrollment(student_id=student_id, course_id=body.course_id)
    db.add(enrollment)
    db.commit()
    db.refresh(enrollment)
    return enrollment

@router.put("/{enrollment_id}", response_model=EnrollmentResponse)
def update_enrollment(
    enrollment_id: int,
    body: EnrollmentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    enrollment = db.query(Enrollment).filter(Enrollment.id == enrollment_id).first()
    if not enrollment:
        raise HTTPException(status_code=404, detail="Matrícula no encontrada")
    role = current_user.role.name
    if role == "estudiante" and enrollment.student_id != current_user.id:
        raise HTTPException(status_code=403, detail="No puedes modificar esta matrícula")
    if role not in ["admin", "estudiante"]:
        raise HTTPException(status_code=403, detail="Acceso denegado")
    enrollment.status = body.status
    db.commit()
    db.refresh(enrollment)
    return enrollment

@router.delete("/{enrollment_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_enrollment(
    enrollment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    enrollment = db.query(Enrollment).filter(Enrollment.id == enrollment_id).first()
    if not enrollment:
        raise HTTPException(status_code=404, detail="Matrícula no encontrada")
    role = current_user.role.name
    if role == "estudiante" and enrollment.student_id != current_user.id:
        raise HTTPException(status_code=403, detail="No puedes eliminar esta matrícula")
    if role not in ["admin", "estudiante"]:
        raise HTTPException(status_code=403, detail="Acceso denegado")
    db.delete(enrollment)
    db.commit()