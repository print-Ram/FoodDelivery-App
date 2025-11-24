import { Injectable} from '@angular/core';
import { Foods } from '../../models/food';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private cartItems: Foods[] = [];
  private cartCountSubject = new BehaviorSubject<number>(0);
  cartCount$ = this.cartCountSubject.asObservable();

  constructor() {}

  loadCart(): void {
    const stored = localStorage.getItem('cart');
    this.cartItems = stored ? JSON.parse(stored) : [];
    this.updateCartCount();
  }

  addToCart(item: Foods): void {
    this.cartItems.push(item);
    this.saveCart();
    this.loadCart();
  }

  removeFromCart(productId: string): void {
    const index = this.cartItems.findIndex(p => p.product_id === productId);
    if (index !== -1) {
      this.cartItems.splice(index, 1);
      this.saveCart();
    }
  }

  getCartItems(): Foods[] {
    return this.cartItems;
  }

  getDistinctProductCount(): number {
    const uniqueIds = new Set(this.cartItems.map(item => item.product_id));
    return uniqueIds.size;
  }

  private saveCart(): void {
    localStorage.setItem('cart', JSON.stringify(this.cartItems));
    this.updateCartCount();
  }

  private updateCartCount(): void {
    const count = this.getDistinctProductCount();
    this.cartCountSubject.next(count);
  }
}