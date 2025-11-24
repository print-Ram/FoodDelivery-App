import { Component, Input, OnInit } from '@angular/core';
import { Coupon, CouponService } from '../coupon.service';
import { FoodService } from '../service/food/food.service';
import { HttpErrorResponse } from '@angular/common/http';



export interface Product {
  product_id: string;
  name: string;
  price: number;
}

@Component({
  selector: 'app-coupon',
  standalone: false,
  templateUrl: './coupon.component.html',
  styleUrls: ['./coupon.component.css']
})
export class CouponComponent implements OnInit {
// coupons: Coupon[] = [];
//   newCoupon: Coupon = { code: '', discount: 0, description: '', active: true };
//   editingCoupon: Coupon | null = null;
//   message = '';
//   isAdmin = true; // toggle true for admin view; false for user view
//   applyCode = '';
//   appliedCoupon: Coupon | null = null;

//   constructor(private couponService: CouponService) {}

//   ngOnInit(): void {
//     if (this.isAdmin) this.fetchAllCoupons();
//     else this.fetchActiveCoupons();
//   }

//   // ===== ADMIN =====
//   fetchAllCoupons() {
//     this.couponService.getAllCoupons().subscribe({
//       next: data => (this.coupons = data),
//       error: err => console.error('Error loading coupons', err)
//     });
//   }

//   addCoupon() {
//     // Ensure all required fields are passed
//     const coupon: Coupon = {
//       code: this.newCoupon.code.trim(),
//       discount: this.newCoupon.discount,
//       description: this.newCoupon.description.trim(),
//       active: true
//     };

//     this.couponService.createCoupon(coupon).subscribe({
//       next: data => {
//         this.coupons.push(data);
//         this.newCoupon = { code: '', discount: 0, description: '', active: true };
//         this.message = '✅ Coupon added successfully!';
//       },
//       error: err => console.error('Error adding coupon:', err)
//     });
//   }

//   editCoupon(coupon: Coupon) {
//     this.editingCoupon = { ...coupon };
//   }

//   updateCoupon() {
//     if (!this.editingCoupon?.id) return;

//     const updatedCoupon = { ...this.editingCoupon };
//     this.couponService.updateCoupon(updatedCoupon.id!, updatedCoupon).subscribe({
//       next: updated => {
//         const idx = this.coupons.findIndex(c => c.id === updated.id);
//         if (idx !== -1) this.coupons[idx] = updated;
//         // ✅ Use timeout to safely clear after Angular refresh
//         setTimeout(() => (this.editingCoupon = null), 0);
//         this.message = '✅ Coupon updated successfully!';
//       },
//       error: err => console.error('Error updating coupon:', err)
//     });
//   }

//   cancelEdit() {
//     this.editingCoupon = null;
//   }

//   deleteCoupon(id?: string) {
//     if (!id) return;

//     this.couponService.deleteCoupon(id).subscribe({
//       next: () => {
//         this.coupons = this.coupons.filter(c => c.id !== id);
//         this.message = '🗑️ Coupon deleted successfully!';
//       },
//       error: err => console.error('Error deleting coupon:', err)
//     });
//   }

//   // ===== USER =====
//   fetchActiveCoupons() {
//     this.couponService.getActiveCoupons().subscribe({
//       next: data => (this.coupons = data),
//       error: err => console.error('Error fetching active coupons:', err)
//     });
//   }

//   applyUserCoupon() {
//     this.couponService.applyCoupon(this.applyCode).subscribe({
//       next: res => {
//         this.appliedCoupon = res;
//         this.message = `✅ Coupon applied: ${res.code} (${res.discount}% off)`;
//       },
//       error: err => {
//         console.error('Error applying coupon:', err);
//         this.message = '❌ Invalid or expired coupon!';
//       }
//     });
//   }
  isAdmin = false;
  message = '';

  coupons: Coupon[] = [];
  products: Product[] = [];

  // For creating new coupon
  newCoupon: Coupon = {
    code: '',
    discount: 0,
    description: '',
    active: true,
    productId: '',
    nthOrder: null
  };

  // For editing existing coupon
  editingCoupon: Coupon | null = null;

  // For user applying a coupon
  applyCode = '';
  appliedCoupon: Coupon | null = null;

  constructor(
    private couponService: CouponService,
    private productService: FoodService
  ) {}

  ngOnInit(): void {
    const role = sessionStorage.getItem('role');
    // Adjust this check based on how you store role
    this.isAdmin = role === 'ADMIN' || role === 'ROLE_ADMIN';

    this.loadCoupons();

    if (this.isAdmin) {
      this.loadProducts();
    }
  }

  // ========== LOAD DATA ==========

  loadCoupons(): void {
    this.couponService.getAllCoupons().subscribe({
      next: (res: Coupon[]) => {
        this.coupons = res || [];
      },
      error: (err: HttpErrorResponse) => {
        console.error(err);
        this.message = 'Failed to load coupons.';
      }
    });
  }

  loadProducts(): void {
    this.productService.getAll().subscribe({
      next: (res: Product[]) => {
        this.products = res || [];
      },
      error: (err: HttpErrorResponse) => {
        console.error('Failed to load products', err);
      }
    });
  }

  // ========== ADMIN: CREATE ==========

  resetNewCoupon(): void {
    this.newCoupon = {
      code: '',
      discount: 0,
      description: '',
      active: true,
      productId: '',
      nthOrder: null
    };
  }

  addCoupon(): void {
    if (!this.newCoupon.code || this.newCoupon.discount <= 0) {
      this.message = 'Please enter coupon code and a valid discount.';
      return;
    }

    this.couponService.createCoupon(this.newCoupon).subscribe({
      next: () => {
        this.message = 'Coupon added successfully.';
        this.resetNewCoupon();
        this.loadCoupons();
      },
      error: (err: HttpErrorResponse) => {
        console.error(err);
        this.message = 'Failed to add coupon.';
      }
    });
  }

  // ========== ADMIN: EDIT / UPDATE / DELETE ==========

  editCoupon(c: Coupon): void {
    // shallow clone so we don't directly modify list until Save
    this.editingCoupon = { ...c };
  }

  updateCoupon(): void {
    if (!this.editingCoupon || !this.editingCoupon.id) {
      return;
    }

    this.couponService.updateCoupon(this.editingCoupon.id, this.editingCoupon).subscribe({
      next: () => {
        this.message = 'Coupon updated successfully.';
        this.editingCoupon = null;
        this.loadCoupons();
      },
      error: (err: HttpErrorResponse) => {
        console.error(err);
        this.message = 'Failed to update coupon.';
      }
    });
  }

  deleteCoupon(id?: string): void {
    if (!id) return;
    if (!confirm('Are you sure you want to delete this coupon?')) return;

    this.couponService.deleteCoupon(id).subscribe({
      next: () => {
        this.message = 'Coupon deleted successfully.';
        this.loadCoupons();
      },
      error: (err: HttpErrorResponse) => {
        console.error(err);
        this.message = 'Failed to delete coupon.';
      }
    });
  }

  // ========== USER: APPLY COUPON (simple look-up) ==========

  applyUserCoupon(): void {
    const code = this.applyCode.trim();
    if (!code) return;

    this.couponService.getCouponByCode(code).subscribe({
      next: (c: Coupon) => {
        this.appliedCoupon = c;
        this.message = `Coupon ${c.code} applied successfully.`;
      },
      error: (err: HttpErrorResponse) => {
        console.error(err);
        this.appliedCoupon = null;
        this.message = 'Invalid or inactive coupon.';
      }
    });
  }

}