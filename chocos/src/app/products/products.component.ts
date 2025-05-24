import { Component, OnInit } from '@angular/core';
import { FoodService } from '../service/food/food.service';
import { Foods } from '../models/food';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';
import { CartService } from '../service/cart/cart.service';
import { AuthService } from '../service/auth/auth.service';

@Component({
  selector: 'app-products',
  standalone: false,
  templateUrl: './products.component.html',
  styleUrl: './products.component.css'
})
export class ProductsComponent implements OnInit {
  foods: Foods[] = [];
  newProduct: Foods = {
    product_id: '',
    name: '',
    price: 0,
    imageurl: '',
    description: '',
  };
  cartQuantities: { [productId: string]: number } = {};
  showAddForm: boolean = false;
  showProductCards: boolean = false;
  showProducts: boolean = true;

  constructor(
    private fs: FoodService,
    private modalService: NgbModal,
    private router: Router,
    private cartService: CartService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadProducts();
    this.loadCartQuantities();
  }

  loadProducts(): void {
    console.log('Loading products...');
    this.fs.getAll().subscribe({
      next: (data) => {
        console.log('Fetched products:', data);
        this.foods = data;
      },
      error: (err) => {
        console.error('Error fetching food data:', err);
        alert('Failed to load products. Please check backend server.');
      },
    });
  }

  loadCartQuantities(): void {
    const cart = sessionStorage.getItem('cart');
    const cartItems: Foods[] = cart ? JSON.parse(cart) : [];
    this.cartQuantities = {};

    cartItems.forEach(item => {
      if (item.product_id) {
        if (!this.cartQuantities[item.product_id]) {
          this.cartQuantities[item.product_id] = 0;
        }
        this.cartQuantities[item.product_id]++;
      }
    });
  }

  isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return Date.now() >= payload.exp * 1000;
    } catch {
      return true;
    }
  }

  addToCart(product: Foods): void {
    if (!product || !product.product_id) return;

    const token = sessionStorage.getItem('token');
    if (!token || this.isTokenExpired(token)) {
      this.router.navigate(['/login']);
      return;
    }

    this.cartService.addToCart(product);

    if (!this.cartQuantities[product.product_id]) {
      this.cartQuantities[product.product_id] = 0;
    }
    this.cartQuantities[product.product_id]++;
  }

  increment(product: Foods): void {
    this.addToCart(product);
  }

  decrement(product: Foods): void {
    if (!product || !product.product_id) return;

    const cart = sessionStorage.getItem('cart');
    let cartItems: Foods[] = cart ? JSON.parse(cart) : [];

    const index = cartItems.findIndex(item => item.product_id === product.product_id);
    if (index !== -1) {
      cartItems.splice(index, 1);
      sessionStorage.setItem('cart', JSON.stringify(cartItems));

      this.cartQuantities[product.product_id]--;
      if (this.cartQuantities[product.product_id] <= 0) {
        delete this.cartQuantities[product.product_id];
      }

      this.cartService.loadCart();
    }
  }
}