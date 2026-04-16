import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CourseService } from '../../../core/services/course';
import { UserService } from '../../../core/services/user';
import { EnrollmentService } from '../../../core/services/enrollment';
import { AuthService } from '../../../core/services/auth';
import { Course } from '../../../core/models/course';
import { User } from '../../../core/models/user';
import { Enrollment } from '../../../core/models/enrollment';

@Component({
  selector: 'app-course-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './course-list.html',
  styleUrl: './course-list.css',
})
export class CourseList implements OnInit {
  courses: Course[]       = [];
  teachers: User[]        = [];
  students: User[]        = [];
  myEnrollments: Enrollment[] = [];   // para estudainte

  loading = true;
  error   = '';

  // ── Course form (admin) ──────────────────────────────────────
  showForm      = false;
  editingCourse: Course | null = null;
  form: FormGroup;
  saving    = false;
  formError = '';
  deletingId: number | null = null;

  // ── Enrollment form ──────────────────────────────────────────
  showEnrollModal    = false;
  enrollingCourse: Course | null = null;
  enrollForm: FormGroup;
  enrollSaving = false;
  enrollError  = '';
  enrollSuccess: number | null = null;   // curso (courseID) que acaba de matricularse
  enrollingId: number | null = null;     // para el spinner por tarjeta (estudiante)

  userRole: string | null = null;

  constructor(
    private courseService: CourseService,
    private userService: UserService,
    private enrollmentService: EnrollmentService,
    private auth: AuthService,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef
  ) {
    this.form = this.fb.group({
      title:       ['', [Validators.required, Validators.minLength(3)]],
      description: [''],
      teacher_id:  [null],
    });

    this.enrollForm = this.fb.group({
      student_id: [null, Validators.required],
    });
  }

  ngOnInit(): void {
    this.userRole = this.auth.getRole();
    this.loadCourses();

    if (this.userRole === 'admin') {
      this.loadTeachers();
      this.loadStudents();
    }

    if (this.userRole === 'estudiante') {
      this.loadMyEnrollments();
    }
  }

  // ── Data loaders ─────────────────────────────────────────────

  loadCourses(): void {
    this.loading = true;
    this.courseService.getAll().subscribe({
      next: courses => {
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
      next: users => {
        this.teachers = users.filter((u: any) => (u.role?.name ?? u.role) === 'profesor');
        this.cdr.detectChanges();
      },
      error: () => {},
    });
  }

  loadStudents(): void {
    this.userService.getAll().subscribe({
      next: users => {
        this.students = users.filter((u: any) => (u.role?.name ?? u.role) === 'estudiante');
        this.cdr.detectChanges();
      },
      error: () => {},
    });
  }

  loadMyEnrollments(): void {
    this.enrollmentService.getAll().subscribe({
      next: data => { this.myEnrollments = data; this.cdr.detectChanges(); },
      error: () => {},
    });
  }

  // ── Course form (admin CRUD) ──────────────────────────────────

  openCreate(): void {
    this.editingCourse = null;
    this.form.reset();
    this.formError = '';
    this.showForm  = true;
  }

  openEdit(course: Course): void {
    this.editingCourse = course;
    this.form.patchValue({
      title:       course.title,
      description: course.description ?? '',
      teacher_id:  course.teacher_id ?? null,
    });
    this.formError = '';
    this.showForm  = true;
  }

  closeForm(): void {
    this.showForm      = false;
    this.editingCourse = null;
    this.form.reset();
  }

  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.saving    = true;
    this.formError = '';
    const val = this.form.value;

    if (this.editingCourse) {
      this.courseService.update(this.editingCourse.id, val).subscribe({
        next:  () => { this.saving = false; this.closeForm(); this.loadCourses(); },
        error: () => { this.formError = 'Error al actualizar el curso.'; this.saving = false; },
      });
    } else {
      this.courseService.create(val).subscribe({
        next:  () => { this.saving = false; this.closeForm(); this.loadCourses(); },
        error: () => { this.formError = 'Error al crear el curso.'; this.saving = false; },
      });
    }
  }

  confirmDelete(id: number): void { this.deletingId = id; }
  cancelDelete(): void            { this.deletingId = null; }

  deleteCourse(id: number): void {
    this.courseService.delete(id).subscribe({
      next:  () => { this.deletingId = null; this.loadCourses(); },
      error: () => { this.deletingId = null; },
    });
  }

  // ── Enrollment: estudiante ────────────────────────────────────

  isEnrolled(courseId: number): boolean {
    return this.myEnrollments.some(e => e.course_id === courseId);
  }

  enrollSelf(course: Course): void {
    this.enrollingId = course.id;
    this.enrollmentService.create({ course_id: course.id }).subscribe({
      next: () => {
        this.enrollingId  = null;
        this.enrollSuccess = course.id;
        this.loadMyEnrollments();
        setTimeout(() => { this.enrollSuccess = null; this.cdr.detectChanges(); }, 2500);
        this.cdr.detectChanges();
      },
      error: err => {
        this.enrollingId = null;
        alert(err?.error?.detail ?? 'No se pudo completar la matrícula.');
        this.cdr.detectChanges();
      },
    });
  }

  // ── Enrollment: admin modal ───────────────────────────────────

  openEnrollAdmin(course: Course): void {
    this.enrollingCourse = course;
    this.enrollForm.reset();
    this.enrollError  = '';
    this.showEnrollModal = true;
  }

  closeEnrollModal(): void {
    this.showEnrollModal = false;
    this.enrollingCourse = null;
    this.enrollForm.reset();
  }

  submitEnrollAdmin(): void {
    if (this.enrollForm.invalid) { this.enrollForm.markAllAsTouched(); return; }
    this.enrollSaving = true;
    this.enrollError  = '';

    this.enrollmentService.create({
      course_id:  this.enrollingCourse!.id,
      student_id: this.enrollForm.value.student_id,
    }).subscribe({
      next: () => {
        this.enrollSaving = false;
        this.closeEnrollModal();
      },
      error: err => {
        this.enrollError  = err?.error?.detail ?? 'Error al matricular.';
        this.enrollSaving = false;
      },
    });
  }

  // ── Display helpers ───────────────────────────────────────────

  getTeacherName(course: any): string {
    if (course.teacher?.name) return course.teacher.name;
    if (course.teacher_id) {
      const t = this.teachers.find(u => u.id === course.teacher_id);
      return t ? t.name : `Profesor #${course.teacher_id}`;
    }
    return 'Sin asignar';
  }

  getInitial(name: string): string {
    return name?.charAt(0)?.toUpperCase() ?? '?';
  }
}