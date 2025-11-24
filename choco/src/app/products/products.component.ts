import { Component, OnInit } from '@angular/core';
import { FoodService } from '../service/food/food.service';
import { Foods } from '../models/food';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';
import { CartService } from '../service/cart/cart.service';

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
    private cartService: CartService
  ) {}

  ngOnInit(): void {
    this.loadProducts();
    this.loadCartQuantities();
  }

  loadProducts(): void {
    this.fs.getAll().subscribe({
      next: (data) => (this.foods = data),
      error: (err) => console.error('Error fetching food data:', err),
    });
  }

  loadCartQuantities(): void {
    const cart = localStorage.getItem('cart');
    const cartItems: Foods[] = cart ? JSON.parse(cart) : [];
    this.cartQuantities = {};

    cartItems.forEach(item => {
      if (!this.cartQuantities[item.product_id]) {
        this.cartQuantities[item.product_id] = 0;
      }
      this.cartQuantities[item.product_id]++;
    });
  }

  addToCart(product: Foods): void {
    const isLoggedIn = !!localStorage.getItem('token');
    if (!isLoggedIn) {
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
    const cart = localStorage.getItem('cart');
    let cartItems: Foods[] = cart ? JSON.parse(cart) : [];

    const index = cartItems.findIndex(item => item.product_id === product.product_id);
    if (index !== -1) {
      cartItems.splice(index, 1);
      localStorage.setItem('cart', JSON.stringify(cartItems));

      this.cartQuantities[product.product_id]--;
      if (this.cartQuantities[product.product_id] <= 0) {
        delete this.cartQuantities[product.product_id];
      }

      // Also update cart service
      this.cartService.loadCart();
    }
  }
}