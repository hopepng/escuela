from database import SessionLocal, Base, engine
from models.roles import Role
from models.user import User
from models.course import Course
from models.enrollment import Enrollment, StatusEnum
from core.security import hash_password

Base.metadata.create_all(bind=engine)

def seed():
    db = SessionLocal()

    if db.query(Role).count() > 0:
        print("Ya existen datos. Seed omitido.")
        db.close()
        return

    # Roles
    admin_role    = Role(name="admin")
    profesor_role = Role(name="profesor")
    student_role  = Role(name="estudiante")
    db.add_all([admin_role, profesor_role, student_role])
    db.commit()
    for r in [admin_role, profesor_role, student_role]:
        db.refresh(r)

    # Usuarios
    admin = User(name="Admin Principal",  email="admin@spa.com",      password=hash_password("admin123"),      role_id=admin_role.id)
    p1    = User(name="Prof. García",     email="garcia@spa.com",     password=hash_password("profesor123"),   role_id=profesor_role.id)
    p2    = User(name="Prof. Martínez",   email="martinez@spa.com",   password=hash_password("profesor123"),   role_id=profesor_role.id)
    e1    = User(name="Est. López",       email="lopez@spa.com",      password=hash_password("estudiante123"), role_id=student_role.id)
    e2    = User(name="Est. Ramírez",     email="ramirez@spa.com",    password=hash_password("estudiante123"), role_id=student_role.id)
    e3    = User(name="Est. Torres",      email="torres@spa.com",     password=hash_password("estudiante123"), role_id=student_role.id)
    db.add_all([admin, p1, p2, e1, e2, e3])
    db.commit()
    for u in [admin, p1, p2, e1, e2, e3]:
        db.refresh(u)

    # Cursos
    c1 = Course(title="Programación Web",      description="HTML, CSS y JavaScript desde cero.", teacher_id=p1.id)
    c2 = Course(title="Bases de Datos",         description="Diseño relacional y SQL.",            teacher_id=p1.id)
    c3 = Course(title="Desarrollo con Angular", description="SPA modernas con Angular.",           teacher_id=p2.id)
    c4 = Course(title="Python Avanzado",        description="POO, decoradores y async.",           teacher_id=p2.id)
    db.add_all([c1, c2, c3, c4])
    db.commit()
    for c in [c1, c2, c3, c4]:
        db.refresh(c)

    # Matrículas
    enrollments = [
        Enrollment(student_id=e1.id, course_id=c1.id, status=StatusEnum.activo),
        Enrollment(student_id=e1.id, course_id=c2.id, status=StatusEnum.activo),
        Enrollment(student_id=e2.id, course_id=c1.id, status=StatusEnum.completado),
        Enrollment(student_id=e2.id, course_id=c3.id, status=StatusEnum.activo),
        Enrollment(student_id=e3.id, course_id=c4.id, status=StatusEnum.inactivo),
        Enrollment(student_id=e3.id, course_id=c2.id, status=StatusEnum.activo),
    ]
    db.add_all(enrollments)
    db.commit()

    db.close()

if __name__ == "__main__":
    seed()