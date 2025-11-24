import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent
} from '@angular/common/http';
import { Observable, finalize } from 'rxjs';
import { AuthService } from '../service/auth/auth.service';
import { LoadingService } from '../loading.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(
    private authService: AuthService,
    private loading: LoadingService
  ) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = this.authService.getToken();

    // Only treat /login and /register as public, everything else is protected
    const isPublic =
      req.url.includes('/api/auth/login') || req.url.includes('/api/auth/register');


    if (token && !isPublic) {
      console.log('[Interceptor] Attaching Authorization token...');
      const authReq = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });

      this.loading.show();

      return next.handle(authReq).pipe(
        finalize(() => this.loading.hide())
      );
    }

    // If no token or it's a public URL, proceed without modifying the request
    return next.handle(req);
  }
}
