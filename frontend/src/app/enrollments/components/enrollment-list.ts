import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { EnrollmentService } from '../../../core/services/enrollment';
import { CourseService } from '../../../core/services/course';
import { AuthService } from '../../../core/services/auth';
import { Enrollment, EnrollmentStatus } from '../../../core/models/enrollment';
import { Course } from '../../../core/models/course';

@Component({
  selector: 'app-enrollment-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './enrollment-list.html',
  styleUrl: './enrollment-list.css',
})
export class EnrollmentList implements OnInit {
  enrollments: Enrollment[] = [];
  courses: Course[] = [];
  availableCourses: Course[] = [];
  loading = true;
  error = '';

  showForm = false;
  editingEnrollment: Enrollment | null = null;
  form: FormGroup;
  saving = false;
  formError = '';
  deletingId: number | null = null;

  userRole: string | null = null;

  constructor(
    private enrollmentService: EnrollmentService,
    private courseService: CourseService,
    private auth: AuthService,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef
  ) {
    this.form = this.fb.group({
      course_id: [null, Validators.required],
      status: ['activo'],
    });
  }

  ngOnInit(): void {
    this.userRole = this.auth.getRole();
    this.load();
    this.loadCourses();
  }

  load(): void {
    this.loading = true;
    this.enrollmentService.getAll().subscribe({
      next: (data) => {
        this.enrollments = data;
        this.loading = false;
        this.error = '';
        this.cdr.detectChanges();
      },
      error: () => {
        this.error = 'Error al cargar matrículas.';
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  loadCourses(): void {
    this.courseService.getAll().subscribe({
      next: (data) => {
        this.courses = data;
        this.cdr.detectChanges();
      },
      error: () => {},
    });
  }

  openEnroll(): void {
    this.editingEnrollment = null;
    this.form.reset();
    this.form.get('course_id')?.setValidators(Validators.required);
    this.form.get('course_id')?.updateValueAndValidity();
    // Filtrar cursos en los que ya está matriculado
    const enrolledIds = this.enrollments.map(e => e.course_id);
    this.availableCourses = this.courses.filter(c => !enrolledIds.includes(c.id));
    this.formError = '';
    this.showForm = true;
  }

  openEdit(enrollment: Enrollment): void {
    this.editingEnrollment = enrollment;
    this.form.patchValue({ status: enrollment.status });
    this.form.get('course_id')?.clearValidators();
    this.form.get('course_id')?.updateValueAndValidity();
    this.formError = '';
    this.showForm = true;
  }

  closeForm(): void {
    this.showForm = false;
    this.editingEnrollment = null;
    this.form.reset();
  }

  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.saving = true;
    this.formError = '';

    if (this.editingEnrollment) {
      this.enrollmentService.update(this.editingEnrollment.id, {
        status: this.form.value.status as EnrollmentStatus
      }).subscribe({
        next: () => { this.saving = false; this.closeForm(); this.load(); },
        error: () => { this.formError = 'Error al actualizar estado.'; this.saving = false; },
      });
    } else {
      this.enrollmentService.create({ course_id: this.form.value.course_id }).subscribe({
        next: () => { this.saving = false; this.closeForm(); this.load(); },
        error: (err) => {
          this.formError = err?.error?.detail ?? 'Error al matricularse.';
          this.saving = false;
        },
      });
    }
  }

  confirmDelete(id: number): void { this.deletingId = id; }
  cancelDelete(): void { this.deletingId = null; }

  deleteEnrollment(id: number): void {
    this.enrollmentService.delete(id).subscribe({
      next: () => { this.deletingId = null; this.load(); },
      error: () => { this.deletingId = null; },
    });
  }

  getCourseName(courseId: number): string {
    const course = this.courses.find(c => c.id === courseId);
    return course ? course.title : `Curso #${courseId}`;
  }

  statusLabel(status: EnrollmentStatus): string {
    const labels: Record<EnrollmentStatus, string> = {
      activo: 'Activo',
      inactivo: 'Inactivo',
      completado: 'Completado'
    };
    return labels[status] ?? status;
  }
}