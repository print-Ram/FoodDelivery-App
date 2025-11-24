import { Component } from '@angular/core';
import { CartService } from '../service/cart/cart.service';
import { AuthService } from '../service/auth/auth.service';

@Component({
  selector: 'app-header',
  standalone: false,
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {
  cartCount = 0;
  isLoggedIn: boolean = false;

constructor(private cartService: CartService,private authService: AuthService) {
  this.authService.isLoggedIn$.subscribe((status: boolean) => this.isLoggedIn = status);
}

ngOnInit(): void {
  this.cartService.cartCount$.subscribe(count => {
    this.cartCount = count;
  });
}

logout(): void {
    this.authService.logout();
  }
}
