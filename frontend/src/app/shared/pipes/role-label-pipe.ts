import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'roleLabel', standalone: true })
export class RoleLabelPipe implements PipeTransform {
  transform(role: string | { name: string }): string {
    const key = typeof role === 'object' ? role.name : role;
    const labels: Record<string, string> = {
      admin: 'Administrador',
      profesor: 'Profesor',
      estudiante: 'Estudiante'
    };
    return labels[key] ?? key;
  }
}