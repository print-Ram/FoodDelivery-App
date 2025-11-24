import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree} from '@angular/router';
import { AuthService } from './service/auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class HomeGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}

  canActivate(): boolean | UrlTree {
    const role = this.auth.getRole();

    // Only non-admins allowed to access "/"
    if (role !== 'ADMIN') {
      return true;
    }

    // Admins get redirected to /admin
    return this.router.createUrlTree(['/admin']);
  }
}

