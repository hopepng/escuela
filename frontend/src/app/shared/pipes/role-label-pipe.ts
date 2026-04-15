import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'roleLabel', standalone: true })
export class RoleLabelPipe implements PipeTransform {
  transform(role: string): string {
    const labels: Record<string, string> = {
      admin: 'Administrador',
      profesor: 'Profesor',
      estudiante: 'Estudiante'
    };
    return labels[role] ?? role;
  }
}