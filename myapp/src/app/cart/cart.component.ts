import { Component, OnInit } from '@angular/core';
import { Foods } from '../models/food';
import { CartService } from '../service/cart/cart.service';

@Component({
  selector: 'app-cart',
  standalone: false,
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.css'
})
export class CartComponent implements OnInit {
  cartItems: Foods[] = [];
  groupedCartItems: any[] = [];

  constructor(private cartService: CartService) {
    const storedItems = localStorage.getItem('cart');
    this.cartItems = storedItems ? JSON.parse(storedItems) : [];
  }

  ngOnInit(): void {
    this.cartService.loadCart();
    this.loadCart();
  }

  loadCart(): void {
    this.cartItems = this.cartService.getCartItems();
    this.groupCartItems();
  }

  groupCartItems(): void {
    const grouped = new Map<string, any>();
    for (const item of this.cartItems) {
      if (grouped.has(item.product_id)) {
        grouped.get(item.product_id).quantity += 1;
      } else {
        grouped.set(item.product_id, { ...item, quantity: 1 });
      }
    }
    this.groupedCartItems = Array.from(grouped.values());
  }

  increment(item: Foods): void {
    this.cartService.addToCart(item);
    this.loadCart();
  }

  decrement(item: Foods): void {
    this.cartService.removeFromCart(item.product_id);
    this.loadCart();
  }

  getTotalPrice(): number {
    return this.groupedCartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  }
}