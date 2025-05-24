import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../service/auth/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(private authService: AuthService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = this.authService.getToken();

    // Public endpoints (exact match or starting with)
    const publicUrls = [
      'https://springboot-app-400542225228.us-central1.run.app/api/products',
      'https://springboot-app-400542225228.us-central1.run.app/api/products/',
      'https://springboot-app-400542225228.us-central1.run.app/api/products/search',
      'https://springboot-app-400542225228.us-central1.run.app/api/auth/login',
      'https://springboot-app-400542225228.us-central1.run.app/api/auth/register'
    ];

    // Check if the request matches a public URL
    const isPublic = publicUrls.some(publicUrl => req.url.startsWith(publicUrl));

    // Only attach token if request is NOT public and token is available
    if (token && !isPublic) {
  console.log('Attaching token to:', req.url);
  const authReq = req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`
    }
  });
  return next.handle(authReq);
}

    // Otherwise send request as-is
    return next.handle(req);
  }
}
