import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CourseService } from '../../../core/services/course';
import { UserService } from '../../../core/services/user';
import { AuthService } from '../../../core/services/auth';
import { Course } from '../../../core/models/course';
import { User } from '../../../core/models/user';

@Component({
  selector: 'app-course-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './course-list.html',
  styleUrl: './course-list.css',
})
export class CourseList implements OnInit {
  courses: Course[] = [];
  teachers: User[] = [];
  loading = true;
  error = '';

  showForm = false;
  editingCourse: Course | null = null;
  form: FormGroup;
  saving = false;
  formError = '';
  deletingId: number | null = null;

  userRole: string | null = null;

  constructor(
    private courseService: CourseService,
    private userService: UserService,
    private auth: AuthService,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef
  ) {
    this.form = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: [''],
      teacher_id: [null],
    });
  }

  ngOnInit(): void {
    this.userRole = this.auth.getRole();
    this.loadCourses();
    if (this.userRole === 'admin') {
      this.loadTeachers();
    }
  }

  loadCourses(): void {
    this.loading = true;
    this.courseService.getAll().subscribe({
      next: (courses) => {
        this.courses = courses;
        this.loading = false;
        this.error = '';
        this.cdr.detectChanges();
      },
      error: () => {
        this.error = 'Error al cargar cursos.';
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  loadTeachers(): void {
    this.userService.getAll().subscribe({
      next: (users) => {
        this.teachers = users.filter((u: any) => (u.role?.name ?? u.role) === 'profesor');
        this.cdr.detectChanges();
      },
      error: () => {},
    });
  }

  openCreate(): void {
    this.editingCourse = null;
    this.form.reset();
    this.formError = '';
    this.showForm = true;
  }

  openEdit(course: Course): void {
    this.editingCourse = course;
    this.form.patchValue({
      title: course.title,
      description: course.description ?? '',
      teacher_id: course.teacher_id ?? null,
    });
    this.formError = '';
    this.showForm = true;
  }

  closeForm(): void {
    this.showForm = false;
    this.editingCourse = null;
    this.form.reset();
  }

  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.saving = true;
    this.formError = '';
    const val = this.form.value;

    if (this.editingCourse) {
      this.courseService.update(this.editingCourse.id, val).subscribe({
        next: () => { this.saving = false; this.closeForm(); this.loadCourses(); },
        error: () => { this.formError = 'Error al actualizar el curso.'; this.saving = false; },
      });
    } else {
      this.courseService.create(val).subscribe({
        next: () => { this.saving = false; this.closeForm(); this.loadCourses(); },
        error: () => { this.formError = 'Error al crear el curso.'; this.saving = false; },
      });
    }
  }

  confirmDelete(id: number): void {
    this.deletingId = id;
  }

  cancelDelete(): void {
    this.deletingId = null;
  }

  deleteCourse(id: number): void {
    this.courseService.delete(id).subscribe({
      next: () => { this.deletingId = null; this.loadCourses(); },
      error: () => { this.deletingId = null; },
    });
  }

  getTeacherName(course: any): string {
    if (course.teacher?.name) return course.teacher.name;
    if (course.teacher_id) {
      const t = this.teachers.find(u => u.id === course.teacher_id);
      return t ? t.name : `ID ${course.teacher_id}`;
    }
    return '—';
  }

  getInitial(name: string): string {
    return name?.charAt(0)?.toUpperCase() ?? '?';
  }
}