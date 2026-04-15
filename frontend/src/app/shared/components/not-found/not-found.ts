import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [RouterModule],
  template: `
    <div style="text-align:center;padding:4rem">
      <h2>404 — Página no encontrada</h2>
      <a routerLink="/login">Volver al inicio</a>
    </div>
  `
})
export class NotFoundComponent {}