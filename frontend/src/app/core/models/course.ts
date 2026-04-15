export interface Course {
  id: number;
  title: string;
  description: string;
  teacher_id: number;
}

export interface CourseCreate {
  title: string;
  description: string;
  teacher_id?: number;
}