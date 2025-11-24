import { Component, OnInit } from '@angular/core';
import { FoodService } from '../service/food/food.service';
import { Foods } from '../models/food';
import { Router } from '@angular/router';
import { CartService } from '../service/cart/cart.service';
import { ActivatedRoute, ParamMap } from '@angular/router';


interface CategoryMeta {
  description: string;
  imageUrl: string;
}

@Component({
  selector: 'app-products',
  standalone: false,
  templateUrl: './products.component.html',
  styleUrl: './products.component.css'
})
export class ProductsComponent implements OnInit {
  foods: Foods[] = [];
  categoryWiseProducts: { [key: string]: Foods[] } = {};
  categoryVisibility: { [key: string]: boolean } = {};
  categoryMeta: { [key: string]: CategoryMeta } = {};
  cartQuantities: { [productId: string]: number } = {};

  isLoading = false;
  loadingMessage = '';
  searchTerm = '';
  suggestions: string[] = [];

  editingCategory: string | null = null;
  editedCategoryName: string = '';
  selectedCategory: string | null = null;


  loadingMessages: string[] = [
    'Cooking up something sweet',
    'Melting chocolate magic',
    'Preparing your treats',
    'Whisking the best for you'
  ];

  constructor(
    private fs: FoodService,
    private cartService: CartService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.loadProducts();
    this.loadCartQuantities();
    this.route.paramMap.subscribe((params: ParamMap) => {
    this.selectedCategory = params.get('category'); // category from URL
    this.loadProducts();
  });

  this.loadCartQuantities();
  }

  isLoggedIn(): boolean {
    const token = sessionStorage.getItem('token');
    return !!token && !this.isTokenExpired(token);
  }

loadProducts(): void {
  this.isLoading = true;
  this.loadingMessage = this.getRandomLoadingMessage();

  this.fs.getAll().subscribe({
    next: (data) => {
      this.foods = data;
      this.categoryWiseProducts = {};
      this.categoryMeta = {};


      data.forEach(product => {
        // Normalize category: map "General", "", null, or undefined to "Other Delights"
        const originalCategory = product.category?.trim();
        const isOther = !originalCategory || originalCategory.toLowerCase() === 'general';
        const category = isOther ? 'Other Delights' : originalCategory;

        if (!this.categoryWiseProducts[category]) {
          this.categoryWiseProducts[category] = [];
          this.categoryVisibility[category] = false;

          this.categoryMeta[category] = {
            description: isOther
              ? 'A delightful collection of unique treats and specials.'
              : (product.categoryDescription ?? ''),
            imageUrl: isOther
              ? 'https://cdn.shopify.com/s/files/1/0425/2699/8690/files/Chocolate_gifs_5_480x480.gif?v=1653491939'
              : (product.categoryBgImageUrl ?? '')
          };
        }

        this.categoryWiseProducts[category].push(product);
      });

      this.isLoading = false;
    },
    error: (err) => {
      console.error('Error fetching food data:', err);
      this.loadingMessage = 'Failed to load products. Please try again later.';
      this.isLoading = false;
    }
  });
}



  loadCartQuantities(): void {
    const cart = sessionStorage.getItem('cart');
    const cartItems: Foods[] = cart ? JSON.parse(cart) : [];
    this.cartQuantities = {};

    cartItems.forEach(item => {
      if (item.product_id) {
        this.cartQuantities[item.product_id] = (this.cartQuantities[item.product_id] || 0) + 1;
      }
    });
  }

  getRandomLoadingMessage(): string {
    const index = Math.floor(Math.random() * this.loadingMessages.length);
    return this.loadingMessages[index];
  }

  increment(product: Foods): void {
    // if (!this.isLoggedIn()) {
    //   this.router.navigate(['/login']);
    //   return;
    // }

    const cart = sessionStorage.getItem('cart');
    const cartItems: Foods[] = cart ? JSON.parse(cart) : [];

    cartItems.push(product);
    sessionStorage.setItem('cart', JSON.stringify(cartItems));

    this.cartQuantities[product.product_id] = (this.cartQuantities[product.product_id] || 0) + 1;
    this.cartService.loadCart();
  }

  decrement(product: Foods): void {
    // if (!this.isLoggedIn()) {
    //   this.router.navigate(['/login']);
    //   return;
    // }

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

  addToCart(product: Foods): void {
  if (!this.isLoggedIn()) {
    this.router.navigate(['/login'], { queryParams: { redirectTo: '/cart' } });
    return;
  } else {
    // existing logic for logged-in users
    this.router.navigate(['/cart']);
  }
}




  isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return Date.now() >= payload.exp * 1000;
    } catch {
      return true;
    }
  }

  toggleCategory(category: string): void {
    this.categoryVisibility[category] = !this.categoryVisibility[category];
  }

//   goToCategory(category: string): void {
//   this.router.navigate(['/products', category]);
// }


  get categoryList(): string[] {
    return Object.keys(this.categoryWiseProducts);
  }

  getDisplayQuantity(productId: string): number {
    return this.cartQuantities[productId] || 0;
  }

  enableEdit(category: string): void {
    this.editingCategory = category;
    this.editedCategoryName = category;
  }

  saveCategoryName(oldName: string): void {
    const newName = this.editedCategoryName.trim();
    if (newName && newName !== oldName) {
      const data = this.categoryWiseProducts[oldName];
      delete this.categoryWiseProducts[oldName];
      this.categoryWiseProducts[newName] = data;

      if (this.categoryMeta[oldName]) {
        this.categoryMeta[newName] = this.categoryMeta[oldName];
        delete this.categoryMeta[oldName];
      }

      this.editingCategory = null;
    }
  }

  cancelEdit(): void {
    this.editingCategory = null;
    this.editedCategoryName = '';
  }
}
