import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Enrollment, EnrollmentCreate, EnrollmentUpdate } from '../models/enrollment';

@Injectable({ providedIn: 'root' })
export class EnrollmentService {
  private apiUrl = `${environment.apiUrl}/enrollments/`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Enrollment[]> {
    return this.http.get<Enrollment[]>(this.apiUrl);
  }

  create(data: EnrollmentCreate): Observable<Enrollment> {
    return this.http.post<Enrollment>(this.apiUrl, data);
  }

  update(id: number, data: EnrollmentUpdate): Observable<Enrollment> {
    return this.http.put<Enrollment>(`${this.apiUrl}${id}`, data);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}${id}`);
  }
}