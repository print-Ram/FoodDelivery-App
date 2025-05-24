import { Component, OnInit } from '@angular/core';
import { FoodService } from '../service/food/food.service';
import { Foods } from '../models/food';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { OrderService } from '../order.service';
import { HttpHeaders } from '@angular/common/http';

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
  };
  showAddForm: boolean = false;
  showUpdateForm = false;
  deleteForm: boolean = false;
  showProducts: boolean = true;
  selectedProduct: Foods = {
    product_id: '',
    name: '',
    price: 0,
    imageurl: '',
    description: '',
  };
  constructor(private fs: FoodService,private modalService: NgbModal,private orderService: OrderService) {}

  ngOnInit(): void {
    this.loadProducts();
    this.getAllOrders();
    console.log("Stored token:", sessionStorage.getItem('token'));
    console.log("Stored role:", sessionStorage.getItem('role'));
  }

  loadProducts(): void {
    this.fs.getAll().subscribe({
      next: (data) => (this.foods = data),
      error: (err) => console.error('Error fetching food data:', err),
    });
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
    };
  }
  toggleAddForm(): void {
    this.showAddForm=this.showAddForm?false:true;
    this.deleteForm = false;
    this.showUpdateForm = false;
    this.showProducts = false;
  }

  toggleshowAll(): void{
    this.deleteForm =  false;
    this.showAddForm = false;
    this.showUpdateForm = false;
    this.showProducts = true;
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
      next: (data) => this.orders = data,
      error: (err) => console.error('Admin fetch failed', err)
    });
  }

  updateStatus(orderId: string, newStatus: string) {
  console.log('Orders:', this.orders);
  console.log('Updating order:', orderId, 'to status:', newStatus);
  if (!orderId) {
    console.error('Invalid orderId:', orderId);
    return;
  }
  this.orderService.updateOrderStatus(orderId, newStatus).subscribe({
    next: () => this.getAllOrders(),
    error: (err) => console.error('Status update failed', err)
  });
}


  deleteOrder(orderId: string) {
    this.orderService.deleteOrder(orderId).subscribe({
      next: () => this.getAllOrders(),
      error: (err) => console.error('Delete failed', err)
    });
  }

}
