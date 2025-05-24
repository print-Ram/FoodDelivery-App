import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private loginUrl = 'https://springboot-app-400542225228.us-central1.run.app/api/auth';
  private isLoggedInSubject = new BehaviorSubject<boolean>(this.hasToken());
  isLoggedIn$ = this.isLoggedInSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {}

  login(credentials: { username: string; password: string }): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post(`${this.loginUrl}/login`, credentials, { headers });
  }
  register(user: any): Observable<any> {
  return this.http.post(`${this.loginUrl}/register`, user);
}
  saveToken(token: string): void {
  sessionStorage.setItem('token', token);

  // Decode token and extract role
  const payload = JSON.parse(atob(token.split('.')[1]));
  const role = payload.role;

  sessionStorage.setItem('role', role); // save role separately
  this.isLoggedInSubject.next(true);
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