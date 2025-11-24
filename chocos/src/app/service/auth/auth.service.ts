import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { User } from '../../models/user';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private loginUrl = 'http://localhost:8080/api/auth';
  private isLoggedInSubject = new BehaviorSubject<boolean>(this.hasToken());
  isLoggedIn$ = this.isLoggedInSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {}

  login(credentials: { username: string; password: string }): Observable<any> {
  const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
  return this.http.post<any>(`${this.loginUrl}/login`, credentials, { headers }).pipe(
    tap(response => {
      if (response.token) {
        sessionStorage.setItem('token', response.token); // ✅ Store token in sessionStorage
        this.isLoggedInSubject.next(true);
      }
    })
  );
}

  register(user: any): Observable<any> {
  return this.http.post(`${this.loginUrl}/register`, user);
}
  saveToken(token: string): void {
  sessionStorage.setItem('token', token);
  const payload = JSON.parse(atob(token.split('.')[1]));
  sessionStorage.setItem('role', payload.role);
  sessionStorage.setItem('userId', payload.userId);
  this.isLoggedInSubject.next(true);
}

getUserId(): string | null {
  const token = sessionStorage.getItem('token');
  if (token) {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.sub || null; // ✅ use 'sub' for user ID
  }
  return null;
}




getUserById(userId: string): Observable<User> {
    return this.http.get<User>(`${this.loginUrl}/${userId}`);
  }

updateUser(userId: string, updatedUser: User): Observable<string> {
  return this.http.put(`${this.loginUrl}/${userId}/update`, updatedUser, {
    responseType: 'text'
  });
}



 getToken(): string | null {
  return sessionStorage.getItem('token');
}


  getRole(): string | null {
  return sessionStorage.getItem('role');
  }


  hasToken(): boolean {
    return !!this.getToken();
  }

  logout(): void {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('cart');
    this.isLoggedInSubject.next(false);
    this.router.navigate(['/login']);
  }

  isAuthenticated(): boolean {
  return this.hasToken();
}
  
}