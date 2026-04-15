from sqlalchemy import Column, Integer, ForeignKey, Enum
from sqlalchemy.orm import relationship
from database import Base
import enum

class StatusEnum(str, enum.Enum):
    activo = "activo"
    inactivo = "inactivo"
    completado = "completado"

class Enrollment(Base):
    __tablename__ = "enrollments"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=False)
    status = Column(Enum(StatusEnum), nullable=False, default=StatusEnum.activo)

    student = relationship("User", backref="enrollments")
    course = relationship("Course", backref="enrollments")