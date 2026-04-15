import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-access-denied',
  standalone: true,
  imports: [RouterModule],
  template: `
    <div style="text-align:center;padding:4rem">
      <h2>Acceso denegado</h2>
      <p>No tienes permisos para ver esta página.</p>
      <a routerLink="/dashboard">Volver al dashboard</a>
    </div>
  `
})
export class AccessDeniedComponent {}