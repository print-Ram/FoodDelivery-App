import { Component, OnInit } from '@angular/core';
import { FoodService } from '../service/food/food.service';
import { Foods } from '../models/food';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { OrderService } from '../order.service';
import { HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';

interface OrderItem {
  product_id: string;
  quantity: number;
  price: number;
  product_name?: string; // We'll assign this based on mapping
}

interface CategoryMeta {
  description: string;
  imageUrl: string;
}

interface Order {
  order_id: string;
  user_id: string;
  items: OrderItem[];
  totalPrice: number;
  status: string;
  orderDate?: any;
  shippingAddress?: any;
}

  interface NavItem {
    label: string;
    icon: string;
    route?: string;
    notificationCount?: number;
    children?: NavItem[];
    expanded?: boolean;
  }


@Component({
  selector: 'app-home',
  standalone: false,
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'], // fixed typo: should be "styleUrls"
})
export class HomeComponent implements OnInit {
  foods: Foods[] = [];
  newProduct: Foods = {
    product_id: '',
    name: '',
    price: 0,
    imageurl: '',
    description: '',
    category: '',
    categoryDescription:'',   // optional
    categoryBgImageUrl:'',
  };
  role: string = '';
  showAddForm: boolean = false;
  showOrders: boolean = false;
  showUpdateForm = false;
  deleteForm: boolean = false;
  showProducts: boolean = true;
  selectOrder: boolean = false;
  selectedProduct: Foods = {
    product_id: '',
    name: '',
    price: 0,
    imageurl: '',
    description: '',
    category: '',
    categoryDescription:'',   // optional
    categoryBgImageUrl:'',
  };
  constructor(private fs: FoodService,private modalService: NgbModal,private orderService: OrderService,private router: Router) {}

  ngOnInit(): void {
    this.loadProducts();
    this.getAllUsers();
    this.getAllOrders();
    this.role = sessionStorage.getItem('role') || '';
  }

categoryWiseProducts: { [key: string]: Foods[] } = {};
categoryVisibility: { [key: string]: boolean } = {};
categoryMeta: { [key: string]: CategoryMeta } = {};

loadProducts(): void {
  this.fs.getAll().subscribe({
    next: (data) => {
      this.foods = data;
      this.categoryWiseProducts = {};
      this.categoryMeta = {};

      data.forEach(product => {
        // Map empty, null, or "General" category to "Other Delights"
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
              ? '/krishva_logo.jpg'
              : (product.categoryBgImageUrl ?? '')
          };
        }

        this.categoryWiseProducts[category].push(product);
      });
    },
    error: (err) => {
      console.error('Error fetching food data:', err);
    }
  });
}

goToCoupons(): void {
    this.router.navigate(['/coupons'], { state: { isAdmin: true } });
  }

toggleCategory(category: string): void {
    this.categoryVisibility[category] = !this.categoryVisibility[category];
  }

get categoryList(): string[] {
  return Object.keys(this.categoryWiseProducts);
}

deleteCategory(category: string): void {
  if (!confirm(`Are you sure you want to delete the category "${category}" and all its products?`)) {
    return;
  }

  const productsToDelete = this.categoryWiseProducts[category] || [];
  
  // Delete each product sequentially
  productsToDelete.forEach(product => {
    this.fs.deleteProduct(product.product_id).subscribe({
      next: () => {
        console.log(`Deleted product ${product.product_id} in category ${category}`);
      },
      error: (err) => console.error('Error deleting product:', err)
    });
  });

  // Remove category from local state
  delete this.categoryWiseProducts[category];
  delete this.categoryVisibility[category];
  delete this.categoryMeta[category];
}





  editProduct(food: Foods): void {
    this.selectedProduct = { ...food };
    this.showProducts = false;
    this.showUpdateForm = true;
    this.deleteForm = false;
  }

  addProduct(): void {
  this.fs.addProduct(this.newProduct).subscribe({
    next: () => {
      this.loadProducts();
      this.resetForm();
      this.toggleshowAll();  // Return to dashboard
    },
    error: (err) => console.error('Error adding product:', err),
  });
}

updateProduct(): void {
  const token = sessionStorage.getItem('token') || '';
  const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

  this.fs.updateProduct(this.selectedProduct.product_id, this.selectedProduct, { headers }).subscribe({
    next: () => {
      this.loadProducts();
      this.resetForm();
      this.toggleshowAll();  // Return to dashboard
    },
    error: (err) => console.error('Error updating product:', err),
  });
}

onImageSelected(event: Event, mode: 'add' | 'update'): void {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = () => {
      const imageDataUrl = reader.result as string;
      if (mode === 'add') {
        this.newProduct.imageurl = imageDataUrl;
      } else if (mode === 'update') {
        this.selectedProduct.imageurl = imageDataUrl;
      }
    };
    reader.readAsDataURL(file); // Converts image to base64 data URL
  }
}




  deleteProduct(product_id: string): void {
    this.fs.deleteProduct(product_id).subscribe({
      next: (response) => {
        console.log("Delete response:", response);  // Logs the response, e.g., "Product with product_id 123 deleted."
        this.loadProducts();  // Reload products after deletion
      },
      error: (err) => {
        console.error('Error deleting product:', err);  // Handles error cases
      },
    });
  }
  

  resetForm(): void {
    this.newProduct = {
      product_id: '',
      name: '',
      price: 0,
      imageurl: '',
      description: '',
      category: '',
      categoryDescription:'',   
      categoryBgImageUrl:'',
    };
  }
  toggleAddForm(): void {
    this.showAddForm=this.showAddForm?false:true;
    this.deleteForm = false;
    this.showUpdateForm = false;
    this.showProducts = false;
  }

  toggleshowOrder(): void{
    this.deleteForm =  false;
    this.showAddForm = false;
    this.showUpdateForm = false;
    this.showProducts = false;
    this.showOrders = true;
    this.showUsers = false;
    this.selectOrder = false;
  }

  toggleshowAll(): void{
    this.deleteForm =  false;
    this.showAddForm = false;
    this.showUpdateForm = false;
    this.showProducts = true;
    this.showUsers = false;
    this.selectOrder = false;
  }
  
  toggleshowOff(): void{
    this.deleteForm =  false;
    this.showAddForm = false;
    this.showUpdateForm = false;
    this.showProducts = false;
  }

  toggleDeleteView(): void {
    this.deleteForm =this.deleteForm?false:true;
    this.showUpdateForm = false;
    this.showAddForm = false;
    this.showProducts = false;
  }
 
  orders: any[] = [];

getAllOrders() {
  this.orderService.getAllOrders().subscribe({
    next: (ordersData) => {
      // Sort latest first (assuming order_time or createdAt is your field)
      this.orders = ordersData.sort((a: any, b: any) => new Date(b.order_time).getTime() - new Date(a.order_time).getTime());

      this.orderService.getAllUsers().subscribe({
        next: (usersData) => {
          const userMap = new Map(usersData.map(user => [user.user_id, user.name]));
          this.orders.forEach(order => {
            order.name = userMap.get(order.user_id) || 'Unknown';
          });
        },
        error: (err) => console.error('Failed to fetch users:', err)
      });
    },
    error: (err) => console.error('Admin fetch failed', err)
  });
}


selectedOrder: Order = {
  order_id: '',
  user_id: '',
  items: [],
  totalPrice: 0,
  status: '',
  orderDate: null,
  shippingAddress: null
};


viewOrderDetails(orderId: string) {
  const userRole = sessionStorage.getItem('role');

  if (userRole === 'ADMIN') {
    this.orderService.getOrderByIdWithProductNames(orderId).subscribe({
      next: (data) => {
        this.selectedOrder = data;
        this.selectOrder = true;
        this.showProducts = false;

        // Ensure items are an array
        if (this.selectedOrder?.items && !Array.isArray(this.selectedOrder.items)) {
          const itemsMap = this.selectedOrder.items as { [key: string]: OrderItem };
          this.selectedOrder.items = Object.values(itemsMap);
        }

        // Log matched product names
        if (this.selectedOrder?.items && Array.isArray(this.selectedOrder.items)) {
          this.selectedOrder.items.forEach(item => {
            const matchingFood = this.foods.find(food => food.product_id === item.product_id);
            if (matchingFood) {
              console.log(`Matched: ${item.product_id} -> ${matchingFood.name}`);
              item.product_name = matchingFood.name; // optional, if needed
            } else {
              console.warn(`No match for product ID: ${item.product_id}`);
            }
          });
        }
      },
      error: (err) => console.error('Failed to fetch order details:', err)
    });
  }
}



updateStatus(orderId: string, newStatus: string): void {
  if (!orderId || !newStatus) {
    console.error('Invalid input:', { orderId, newStatus });
    return;
  }

  if (newStatus === 'SHIPPED') {
    // Prompt for shipping details
    const senderName = prompt('Enter Sender Name:');
    const courierService = prompt('Enter Courier Service:');
    const trackingId = prompt('Enter Tracking ID:');

    if (!senderName || !courierService || !trackingId) {
      alert('All shipping details are required to mark as SHIPPED.');
      return;
    }

    console.log(`📦 Shipping info for order ${orderId}:`, { senderName, courierService, trackingId });

    this.orderService.updateShippingDetails(orderId, senderName, courierService, trackingId).subscribe({
      next: (response) => {
        console.log(`✅ Shipping details updated: ${response}`);
        this.getAllOrders(); // Refresh list
      },
      error: (err) => {
        console.error('❌ Failed to update shipping details:', err.message || err);
        alert(`Failed to update shipping details: ${err?.error || 'Unknown error'}`);
      }
    });

  } else {
    // Other status updates (DELIVERED, CANCELLED, etc.)
    this.orderService.updateOrderStatus(orderId, newStatus).subscribe({
      next: (response) => {
        console.log(`✅ Status updated: ${response}`);
        this.getAllOrders();
      },
      error: (err) => {
        console.error('❌ Status update failed:', err.message || err);
        alert(`Failed to update order status: ${err?.error || 'Unknown error'}`);
      }
    });
  }
}

getCountByStatus(status: string): number {
  return this.orders.filter(order => order.status === status).length;
}




deleteOrder(orderId: string) {
  this.orderService.deleteOrder(orderId).subscribe({
    next: () => this.getAllOrders(),
    error: (err) => console.error('Delete failed', err)
  });
}

//Users
showUsers = false;
users: any[] = [];

toggleUserView() {
  this.showUsers = !this.showUsers;
  if (this.showUsers) {
    this.getAllUsers();
  }
  this.deleteForm = false;
  this.showUpdateForm = false;
  this.showAddForm = false;
  this.showProducts = false;
}

getAllUsers(): void {
  this.orderService.getAllUsers().subscribe({
    next: (data) => {
      this.users = data;
    },
    error: (error) => {
      console.error('Failed to fetch users:', error);
    }
  });
}

deleteUser(userId: string): void {
  this.orderService.deleteUser(userId).subscribe({
    next: () => {
      this.getAllUsers(); // Refresh the user list after deletion
    },
    error: (err) => {
      console.error('User deletion failed', err);
    }
  });
}

selectedUser: any = null;
showUserDetails: boolean = false;

viewUserDetails(userId: string): void {
  this.orderService.getUserById(userId).subscribe({
    next: (user) => {
      this.selectedUser = user;
      this.showUserDetails = true;
      this.showProducts = false;
    },
    error: (err) => {
      console.error('Failed to fetch user details:', err);
    }
  });
}

markShipped(order: any) {
  this.updateStatus(order.order_id, 'SHIPPED');
}

markCompleted(order: any) {
  this.updateStatus(order.order_id, 'DELIVERED'); // Persist to backend
}

get totalUsers(): number {
  return this.users.length;
}




}