export type EnrollmentStatus = 'activo' | 'inactivo' | 'completado';

export interface Enrollment {
  id: number;
  student_id: number;
  course_id: number;
  status: EnrollmentStatus;
}

export interface EnrollmentCreate {
  course_id: number;
  student_id?: number;
}

export interface EnrollmentUpdate {
  status: EnrollmentStatus;
}