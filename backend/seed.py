from database import SessionLocal, Base, engine
import models.user
import models.course
from models.user import User, RoleEnum
from models.course import Course
from core.security import hash_password

Base.metadata.create_all(bind=engine)

def seed():
    db = SessionLocal()

    if db.query(User).count() > 0:
        print("Ya existen datos. Seed omitido.")
        db.close()
        return

    users = [
        User(name="Admin Principal", email="admin@spa.com",   password=hash_password("admin123"),    role=RoleEnum.admin),
        User(name="Prof. García",    email="profesor@spa.com", password=hash_password("profesor123"), role=RoleEnum.profesor),
        User(name="Est. López",      email="estudiante@spa.com", password=hash_password("estudiante123"), role=RoleEnum.estudiante),
    ]
    db.add_all(users)
    db.commit()
    for u in users:
        db.refresh(u)

    profesor = db.query(User).filter(User.role == RoleEnum.profesor).first()

    courses = [
        Course(title="Programación Web",         description="HTML, CSS y JavaScript desde cero.",          teacher_id=profesor.id),
        Course(title="Bases de Datos",            description="Diseño relacional y SQL con PostgreSQL.",      teacher_id=profesor.id),
        Course(title="Desarrollo con Angular",    description="SPA modernas con Angular y TypeScript.",       teacher_id=profesor.id),
    ]
    db.add_all(courses)
    db.commit()

    print("Seed completado:")
    print("  admin@spa.com        / admin123")
    print("  profesor@spa.com     / profesor123")
    print("  estudiante@spa.com   / estudiante123")
    db.close()

if __name__ == "__main__":
    seed()