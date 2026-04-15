import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth-guard';
import { LoginGuard } from './core/guards/login-guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  {
    path: 'login',
    canActivate: [LoginGuard],
    loadComponent: () => import('./auth/components/login/login').then(m => m.LoginComponent)
  },
  {
    path: 'dashboard',
    canActivate: [AuthGuard],
    loadComponent: () => import('./dashboard/dashboard').then(m => m.DashboardComponent),
    children: [
      {
        path: 'courses',
        canActivate: [AuthGuard],
        loadComponent: () => import('./courses/components/course-list/course-list').then(m => m.CourseList)
      },
      {
        path: 'users',
        canActivate: [AuthGuard],
        data: { roles: ['admin'] },
        loadComponent: () => import('./users/components/user-list/user-list').then(m => m.UserList)
      }
    ]
  },
  {
    path: 'access-denied',
    loadComponent: () => import('./shared/components/access-denied/access-denied').then(m => m.AccessDeniedComponent)
  },
  {
    path: '**',
    loadComponent: () => import('./shared/components/not-found/not-found').then(m => m.NotFoundComponent)
  }
];