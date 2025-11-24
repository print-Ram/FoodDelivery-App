import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { Foods } from '../models/food';
import { CartService } from '../service/cart/cart.service';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Coupon, CouponService } from '../coupon.service';
import { Address } from '../models/address';
import { AddressService } from '../address.service';

declare var Razorpay: any;

export interface AddressSuggestion {
  fullAddress: string;
  area: string;
  city: string;
  state: string;
  postalCode: string;
}

export interface AddressFromCoords extends AddressSuggestion {
  distanceKm: number;
  deliveryFee: number;
}

@Component({
  selector: 'app-cart',
  standalone: false,
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.css'
})
export class CartComponent implements OnInit {

  cartItems: Foods[] = [];
  groupedCartItems: any[] = [];

  // Coupon
  appliedCoupon: Coupon | null = null;
  couponCode: string = '';
  couponError: string = '';
  discountAmount: number = 0;
  isApplyingCoupon: boolean = false;

  // Address handling
  addresses: Address[] = [];
  selectedAddressId: string = '';
  selectedAddress?: Address;
  hasAddresses: boolean = false;
  coupons: Coupon[] = [];
  isLoadingAddresses: boolean = false;
  addressError: string = '';
  showAddressForm: boolean = false;

  newAddress: Address = {
    name: '',
    phone: '',
    country: '',
    line1: '',
    line2: '',
    city: '',
    state: '',
    postalCode: '',
    isDefault: true
  };
  addressSearchTerm = '';
  addressSuggestions: AddressSuggestion[] = [];
  isSearchingAddress = false;
  addressSearchError = '';

  // ✅ Delivery fee based on location (from backend)
  shippingFee: number = 0;
  shippingDistanceKm: number | null = null;
  isDetectingLocation = false;
  locationError = '';


  @ViewChild('orderSuccess') orderSuccess!: TemplateRef<any>;
  @ViewChild('paymentFailed') paymentFailed!: TemplateRef<any>;

  constructor(
    private cartService: CartService,
    private http: HttpClient,
    private router: Router,
    private modalService: NgbModal,
    private couponService: CouponService,
    private addressService: AddressService
  ) {}

  ngOnInit(): void {
    this.cartService.loadCart();
    this.loadCart();
    this.fetchAddresses();
    this.fetchAvailableCoupons();
  }

  loadCart(): void {
    this.cartItems = this.cartService.getCartItems();
    this.groupCartItems();
  }

  public goToCart(): void {
    this.router.navigate(['/cart']);
  }

  public goToOrders(): void {
    this.router.navigate(['/orders']);
  }

  increment(item: Foods): void {
    this.cartService.addToCart(item);
    this.loadCart();
  }

  decrement(item: Foods): void {
    this.cartService.removeFromCart(item.product_id);
    this.loadCart();
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

  // ---------------- ADDRESS LOGIC ----------------

  fetchAddresses(): void {
  const userId = sessionStorage.getItem('userId');
  this.isLoadingAddresses = true;
  this.addressError = '';
  this.hasAddresses = false;
  this.addresses = [];
  this.showAddressForm = false;
  this.isEditingAddress = false;
  this.editingAddressId = null;

  if (!userId) {
    this.isLoadingAddresses = false;
    this.showAddressForm = true;
    return;
  }

  this.addressService.getUserAddresses(userId).subscribe({
    next: (res) => {
      this.isLoadingAddresses = false;
      this.addresses = res;
      this.hasAddresses = res.length > 0;

      if (res.length === 0) {
        this.showAddressForm = true;
        return;
      }

      const defaultAddr = res.find(a => a.isDefault);
      const selected = defaultAddr || res[0];
      this.selectedAddressId = selected.addressId!;
      this.selectedAddress = selected;
    },
    error: (err) => {
      console.error('Failed to load addresses', err);
      this.isLoadingAddresses = false;
      this.addressError = 'Could not load saved addresses. Please add a new one.';
      this.showAddressForm = true;
    }
  });
}

isEditingAddress: boolean = false;
editingAddressId: string | null = null;


  editAddress(addr: Address): void {
  this.isEditingAddress = true;
  this.editingAddressId = addr.addressId || null;

  // Pre-fill form with existing address values
  this.newAddress = {
    name: addr.name,
    phone: addr.phone,
    country: addr.country,
    line1: addr.line1,
    line2: addr.line2,
    city: addr.city,
    state: addr.state,
    postalCode: addr.postalCode,
    isDefault: addr.isDefault
  };

  this.showAddressForm = true;
  this.addressError = '';
}


  onAddressChange(addrId: string): void {
    this.selectedAddressId = addrId;
    this.selectedAddress = this.addresses.find(a => a.addressId === addrId);

    // Update shipping fee from saved address if available
    if (this.selectedAddress) {
      this.shippingFee = this.selectedAddress.deliveryFee ?? 0;
      this.shippingDistanceKm = this.selectedAddress.distanceKm ?? null;
    } else {
      this.shippingFee = 0;
      this.shippingDistanceKm = null;
    }
  }

  enableNewAddress(): void {
    this.showAddressForm = true;
    this.addressError = '';
  }

  cancelNewAddress(): void {
    if (!this.hasAddresses) {
     this.addressSearchTerm = '';
  this.addressSuggestions = [];
    this.newAddress = {
      name: '',
      phone: '',
      country: '',
      line1: '',
      line2: '',
      city: '',
      state: '',
      postalCode: '',
      isDefault: true
    };
    return;
  }
  
  this.showAddressForm = false;
  this.isEditingAddress = false;
  this.editingAddressId = null;

  if (!this.hasAddresses) {
    this.selectedAddressId = '';
    this.selectedAddress = undefined;
  }
}

deleteAddress(addressId: string): void {
  const userId = sessionStorage.getItem('userId');

  if (!userId) {
    alert("You must be logged in to delete an address.");
    return;
  }

  if (!confirm("Are you sure you want to delete this address?")) {
    return;
  }

  this.addressService.deleteAddress(userId, addressId).subscribe({
    next: () => {
      this.fetchAddresses();   // reload list after delete
    },
    error: (err) => {
      console.error("Failed to delete address", err);
      this.addressError = "Failed to delete address. Please try again.";
    }
  });
}



  saveAddress(): void {
  const userId = sessionStorage.getItem('userId');
  if (!userId) {
    alert('You must be logged in to save an address.');
    return;
  }

  const payload: Address = {
    ...this.newAddress,
    userId: userId
  };

  this.addressError = '';

  // 🔹 EDIT EXISTING
  if (this.isEditingAddress && this.editingAddressId) {
    this.addressService.updateAddress(this.editingAddressId, payload).subscribe({
      next: () => {
        this.resetAddressFormState();
        this.fetchAddresses();
      },
      error: (err) => {
        console.error('Failed to update address', err);
        this.addressError = 'Failed to update address. Please try again.';
      }
    });
  } 
  // 🔹 ADD NEW
  else {
    this.addressService.addAddress(payload).subscribe({
      next: () => {
        this.resetAddressFormState();
        this.fetchAddresses();
      },
      error: (err) => {
        console.error('Failed to save address', err);
        this.addressError = 'Failed to save address. Please try again.';
      }
    });
  }
}

// helper to clean up
private resetAddressFormState(): void {
  this.newAddress = {
    name: '',
    phone: '',
    country: '',
    line1: '',
    line2: '',
    city: '',
    state: '',
    postalCode: '',
    isDefault: true
  };
  this.showAddressForm = false;
  this.isEditingAddress = false;
  this.editingAddressId = null;
}



// -----------------------------------
  //  AUTOCOMPLETE SUGGESTIONS
  //  /auth/orders/address-suggestions
  // -----------------------------------
 onAddressSearchChange(term: string): void {
    this.addressSearchError = '';
    this.addressSearchTerm = term;

    if (!term || term.trim().length < 3) {
      this.addressSuggestions = [];
      return;
    }

    this.isSearchingAddress = true;
    this.addressService.getAddressSuggestions(term.trim()).subscribe({
      next: (res) => {
        this.isSearchingAddress = false;
        this.addressSuggestions = res || [];
      },
      error: (err) => {
        console.error('Address autocomplete failed', err);
        this.isSearchingAddress = false;
        this.addressSuggestions = [];
        this.addressSearchError = 'Could not fetch address suggestions.';
      }
    });
  }

  applyAddressSuggestion(s: AddressSuggestion): void {
    this.addressSearchTerm = s.fullAddress;
    this.addressSuggestions = [];

    this.newAddress.line1 = s.area || s.fullAddress;
    this.newAddress.city = s.city || '';
    this.newAddress.state = s.state || '';
    this.newAddress.postalCode = s.postalCode || '';

    // country is assumed India
    this.newAddress.country = 'India';
  }

  // -----------------------------------
  //  USE CURRENT LOCATION
  //  /auth/orders/get-address?lat=..&lng=..
  // -----------------------------------
  useMyLocation(): void {
    this.locationError = '';
    if (!navigator.geolocation) {
      this.locationError = 'Geolocation is not supported by this browser.';
      return;
    }

    this.isDetectingLocation = true;

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;

        this.addressService.getAddressFromCoords(lat, lng).subscribe({
          next: (data: AddressFromCoords) => {
            this.isDetectingLocation = false;

            // Fill the address form
            this.newAddress.line1 = data.area || data.fullAddress;
            this.newAddress.city = data.city || '';
            this.newAddress.state = data.state || '';
            this.newAddress.postalCode = data.postalCode || '';
            this.newAddress.country = 'India';

            this.addressSearchTerm = data.fullAddress;
            this.addressSuggestions = [];

            // Fill shipping info
            this.shippingFee = data.deliveryFee;
            this.shippingDistanceKm = data.distanceKm;
          },
          error: (err) => {
            console.error('Failed to get address from coordinates', err);
            this.isDetectingLocation = false;
            this.locationError = 'Failed to detect address from your location.';
          }
        });
      },
      (err) => {
        console.error('Geolocation error', err);
        this.isDetectingLocation = false;
        this.locationError = 'Could not get your location. Please allow location access.';
      }
    );
  }


//--------MODAL------
selectedActionAddress: Address | null = null;
showAddressActionModal: boolean = false;

openAddressActionModal(addr: Address): void {
  this.selectedActionAddress = addr;
  this.showAddressActionModal = true;
}

closeAddressActionModal(): void {
  this.showAddressActionModal = false;
  this.selectedActionAddress = null;
}

onEditAddressFromModal(): void {
  if (this.selectedActionAddress) {
    this.editAddress(this.selectedActionAddress);
  }
  this.closeAddressActionModal();
}

onDeleteAddressFromModal(): void {
  if (this.selectedActionAddress?.addressId) {
    this.deleteAddress(this.selectedActionAddress.addressId);
  }
  this.closeAddressActionModal();
}



  // ---------------- COUPON LOGIC ----------------

  applyCoupon(): void {
  if (!this.couponCode.trim()) {
    return;
  }
  this.isApplyingCoupon = true;
  this.couponError = '';

  const userId = sessionStorage.getItem('userId') || '';
  const couponRequest = {
    code: this.couponCode,
    userId,
    orderTotal: this.getCartTotal(),
    items: this.groupedCartItems
  };

  this.couponService.applyCoupon(couponRequest).subscribe({
    next: (res: any) => {
      this.appliedCoupon = res;
      this.discountAmount = res.discount || 0;
      this.isApplyingCoupon = false;      // ✅ reset here
    },
    error: () => {
      this.appliedCoupon = null;
      this.discountAmount = 0;
      this.couponError = 'Invalid or expired coupon.';
      this.isApplyingCoupon = false;      // ✅ and reset here too
    }
  });
}


  removeCoupon(): void {
    this.appliedCoupon = null;
    this.couponCode = '';
    this.discountAmount = 0;
    this.couponError = '';
  }

  isLoadingCoupons = false;
  couponsError: string = '';
  // ✅ NEW: fetch all coupons for display
  fetchAvailableCoupons(): void {
    this.isLoadingCoupons = true;
    this.couponsError = '';

    this.couponService.getAllCoupons().subscribe({
      next: (res: Coupon[]) => {
        this.coupons = res || [];
        this.isLoadingCoupons = false;
      },
      error: () => {
        this.couponsError = 'Could not load sweet deals right now.';
        this.isLoadingCoupons = false;
      }
    });
  }

  // ✅ NEW: when user clicks "Activate" on a card
  activateCoupon(c: Coupon): void {
    if (this.appliedCoupon) {
      return; // already applied; optional safeguard
    }
    this.couponCode = c.code;
    this.applyCoupon();
  }

  // ---------------- PRICE HELPERS ----------------

  getTotalPrice(items: { price: number; quantity: number }[]): number {
    return items.reduce((total, item) => total + (item.price * item.quantity), 0);
  }

  getCartTotal(): number {
    return this.getTotalPrice(this.groupedCartItems);
  }

  getPayableAmount(): number {
    const total = this.getCartTotal();
    const discount = this.discountAmount || 0;
    const base = this.getCartTotal() - this.discountAmount;
    return base + this.shippingFee;
  }

  // ---------------- PAYMENT ----------------

  buyNow(): void {
    if (!this.selectedAddressId) {
      alert('Please select or add a delivery address');
      return;
    }

    const token = sessionStorage.getItem('token') || '';
    const totalAmount = this.getCartTotal();
    const amountToPay = this.getPayableAmount();

    // For safety, re-validate coupon on backend
    if (this.appliedCoupon) {
      const userId = sessionStorage.getItem('userId') || '';
      const couponRequest = {
        code: this.appliedCoupon.code,
        userId,
        orderTotal: totalAmount,
        items: this.groupedCartItems
      };
      this.couponService.applyCoupon(couponRequest).subscribe({
        next: (res: any) => {
          const discountedAmount = totalAmount - (res.discount || 0);
          this.processPayment(discountedAmount, token, totalAmount);
        },
        error: () => {
          alert('Coupon validation failed. Proceeding with full amount.');
          this.processPayment(totalAmount, token, totalAmount);
        }
      });
    } else {
      this.processPayment(amountToPay, token, totalAmount);
    }
  }

  private processPayment(amountToPay: number, token: string, originalAmount: number) {
    this.http.post<any>(
      'http://localhost:8080/auth/orders/create-payment',
      { amount: amountToPay },
      { headers: { Authorization: `Bearer ${token}` } }
    ).subscribe({
      next: (response) => {
        const options = {
          key: 'rzp_test_ZFRZgGGwyk6bgC',
          amount: response.amount,
          currency: response.currency,
          order_id: response.id,
          method: { upi: true },
          handler: (paymentResponse: any) => {
            const orderPayload = {
              items: this.groupedCartItems,
              totalPrice: originalAmount,
              discountedPrice: amountToPay,
              status: 'CONFIRMED',
              orderDate: new Date().toISOString(),
              addressId: this.selectedAddressId,
              appliedCoupon: this.appliedCoupon?.code || null
            };

            this.http.post(
              'http://localhost:8080/auth/orders/place',
              orderPayload,
              {
                headers: { Authorization: `Bearer ${token}` },
                responseType: 'text'
              }
            ).subscribe({
              next: () => {
                this.modalService.open(this.orderSuccess);
                sessionStorage.removeItem('cart');
                this.cartService.clearCart();
                this.router.navigate(['/orders']);
              },
              error: () => alert('Order failed')
            });
          }
        };

        const rzp = new Razorpay(options);
        rzp.open();
      },
      error: () => alert('Failed to initiate payment')
    });
  }
}
