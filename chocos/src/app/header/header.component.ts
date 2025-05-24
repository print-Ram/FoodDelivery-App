import { Component, HostListener, OnInit } from '@angular/core';
import { CartService } from '../service/cart/cart.service';
import { AuthService } from '../service/auth/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: false,
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent implements OnInit {
  isLoggedIn = false;
  cartCount = 0;
  role: string | null = null;
  isScrolled = false;

  constructor(
    private cartService: CartService,
    private authService: AuthService,
    private router: Router
  ) {
    this.authService.isLoggedIn$.subscribe((status: boolean) => {
      this.isLoggedIn = status;
      this.role = this.authService.getRole(); // Update role when login status changes
    });
  }

  ngOnInit(): void {
    this.cartService.cartCount$.subscribe(count => {
      this.cartCount = count;
    });

    this.isLoggedIn = this.authService.isAuthenticated();
    this.role = this.authService.getRole(); // Get role on init if already logged in
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']).then(() => {
      window.location.reload(); // Refresh the role-based UI
    });
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.isScrolled = window.scrollY > 30;
  }
}
