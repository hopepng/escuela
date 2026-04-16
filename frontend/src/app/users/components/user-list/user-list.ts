import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserService } from '../../../core/services/user';
import { User } from '../../../core/models/user';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './user-list.html',
  styleUrl: './user-list.css',
})
export class UserList implements OnInit {
  users: User[] = [];
  loading = true;
  error = '';

  showForm = false;
  editingUser: User | null = null;
  form: FormGroup;
  saving = false;
  formError = '';
  deletingId: number | null = null;

  readonly roles = [
    { value: 1, label: 'Administrador' },
    { value: 2, label: 'Profesor' },
    { value: 3, label: 'Estudiante' },
  ];

  readonly roleLabels: Record<string, string> = {
    admin: 'Administrador',
    profesor: 'Profesor',
    estudiante: 'Estudiante',
  };

  constructor(
    private userService: UserService,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef   // ← agregar esto
  ) {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      role_id: [null, Validators.required],
    });
  }

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading = true;
    this.userService.getAll().subscribe({
      next: (users) => {
        this.users = users;
        this.loading = false;
        this.error = '';
        this.cdr.detectChanges();   // ← forzar detección
      },
      error: (err) => {
        this.error = 'Error al cargar usuarios.';
        this.loading = false;
        this.cdr.detectChanges();   // ← forzar detección
      },
    });
  }

  openCreate(): void {
    this.editingUser = null;
    this.form.reset();
    this.form.get('password')?.setValidators(Validators.required);
    this.form.get('password')?.updateValueAndValidity();
    this.formError = '';
    this.showForm = true;
  }

  openEdit(user: User): void {
    this.editingUser = user;
    this.form.patchValue({
      name: user.name,
      email: user.email,
      password: '',
      role_id: null,
    });
    this.form.get('password')?.clearValidators();
    this.form.get('password')?.updateValueAndValidity();
    this.formError = '';
    this.showForm = true;
  }

  closeForm(): void {
    this.showForm = false;
    this.editingUser = null;
    this.form.reset();
  }

  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.saving = true;
    this.formError = '';
    const val = this.form.value;

    if (this.editingUser) {
      const payload: any = { name: val.name, email: val.email };
      if (val.role_id) payload.role_id = val.role_id;
      this.userService.update(this.editingUser.id, payload).subscribe({
        next: () => { this.saving = false; this.closeForm(); this.loadUsers(); },
        error: () => { this.formError = 'Error al actualizar usuario.'; this.saving = false; },
      });
    } else {
      this.userService.create(val).subscribe({
        next: () => { this.saving = false; this.closeForm(); this.loadUsers(); },
        error: () => { this.formError = 'Error al crear usuario.'; this.saving = false; },
      });
    }
  }

  confirmDelete(id: number): void {
    this.deletingId = id;
  }

  cancelDelete(): void {
    this.deletingId = null;
  }

  deleteUser(id: number): void {
    this.userService.delete(id).subscribe({
      next: () => { this.deletingId = null; this.loadUsers(); },
      error: () => { this.deletingId = null; },
    });
  }

  getInitial(name: string): string {
    return name?.charAt(0)?.toUpperCase() ?? '?';
  }
  
  getRoleName(role: any): string {
  return role?.name ?? role ?? '';
}

  getRoleLabel(role: any): string {
    return this.roleLabels[role?.name ?? role] ?? role;
  }
}