import { Component, ElementRef, HostListener, OnInit } from '@angular/core';
import { CartService } from '../service/cart/cart.service';
import { AuthService } from '../service/auth/auth.service';
import { Router } from '@angular/router';
import { OrderService } from '../order.service';
import { User } from '../models/user';

@Component({
  selector: 'app-header',
  standalone: false,
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent implements OnInit {
  isLoggedIn = false;
  role: string | null = null;
  isScrolled = false;
  selectedUser: any = null;
  user: User = {};

  constructor(
    private cartService: CartService,
    private authService: AuthService,
    private orderService: OrderService,
    private router: Router,
    private el: ElementRef
  ) {
    this.authService.isLoggedIn$.subscribe((status: boolean) => {
      this.isLoggedIn = status;
      this.role = this.authService.getRole(); // Update role when login status changes
    });
  }

  ngOnInit(): void {
  this.updateCartCount();
  this.cartService.cartCount$.subscribe(count => {
    this.cartCount = count;
  });

  this.isLoggedIn = this.authService.isAuthenticated();
  this.role = this.authService.getRole();

  if (this.isLoggedIn) {
    const userId = this.authService.getUserId();
    if (userId) {
      this.authService.getUserById(userId).subscribe(u => this.user = u);
    }
  }

}

brandLetters = Array.from('Krishva Chocolates');
  isVisible = false;


  @HostListener('window:scroll', [])
  onScroll(): void {
    const rect = this.el.nativeElement.getBoundingClientRect();
    const viewHeight = window.innerHeight;
    if (rect.top < viewHeight - 100) {
      this.isVisible = true;
    }
  }

updateUser(): void {
  if (this.user && this.user.user_id) {
    this.authService.updateUser(this.user.user_id, this.user).subscribe(() => {
      alert('Profile updated successfully!');
    });
  } else {
    alert('User ID is missing. Cannot update profile.');
  }
}

sideNavOpen = false;
selectedSection: 'home' | 'orders' | 'account' | 'settings' | null = null;

toggleSideNav(): void {
  this.sideNavOpen = !this.sideNavOpen;
  if (!this.sideNavOpen) {
    this.selectedSection = null;
  }
}

showSection(section: 'home' | 'orders' | 'account' | 'settings'): void {
  this.selectedSection = section;
  this.sideNavOpen = false;
}

get isLoginPage(): boolean {
    return this.router.url === '/login';
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

cartCount = 0;

updateCartCount(): void {
  const cart = sessionStorage.getItem('cart');
  const cartItems = cart ? JSON.parse(cart) : [];
  this.cartCount = cartItems.length;
}
}