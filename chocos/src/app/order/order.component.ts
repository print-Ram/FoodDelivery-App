import { Component, OnInit } from '@angular/core';
import { OrderService } from '../order.service';
import { FoodService } from '../service/food/food.service';
import { Foods } from '../models/food';

interface OrderItem {
  product_id: string;
  quantity: number;
  price: number;
  product_name?: string;
  imageurl?: string;
}

interface Order {
  order_id: string;
  user_id: string;
  items: OrderItem[];
  totalPrice: number;
  status: string;
  orderDate?: any;
  shippingAddress?: string;
  expanded?: boolean;
  senderName?: string;
  courierService?: string;
  trackingId?: string;
}


@Component({
  selector: 'app-order',
  standalone: false,
  templateUrl: './order.component.html',
  styleUrl: './order.component.css'
})
export class OrderComponent implements OnInit {
  orders: Order[] = [];
  foods: Foods[] = [];
  isLoading = false;
  loadingMessage = 'Loading your orders';

  constructor(private orderService: OrderService, private fs: FoodService) {}

  ngOnInit(): void {
    this.loadProducts(); // Do not call loadOrders here
  }

  loadProducts(): void {
    this.isLoading = true;
    this.loadingMessage = 'Getting details of what you liked 😊';

    this.fs.getAll().subscribe({
      next: (data) => {
        this.foods = data;
        this.loadOrders(); // Load orders after products
      },
      error: (err) => {
        console.error('Failed to load products:', err);
        this.isLoading = false;
      }
    });
  }

  loadOrders(): void {
    this.orderService.getMyOrders().subscribe({
      next: (data) => {
        this.orders = data
          .map((order: Order) => ({
            ...order,
            expanded: false // add expanded property
          }))
          .sort((a: Order, b: Order) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime());

        // enrich items with product info
        this.orders.forEach(order => {
          if (order.items && Array.isArray(order.items)) {
            order.items.forEach(item => {
              const product = this.foods.find(f => f.product_id === item.product_id);
              if (product) {
                item.product_name = product.name;
                item.imageurl = product.imageurl;
                item.price = product.price;
              }
            });
          }
        });

        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to fetch orders:', err);
        this.isLoading = false;
      }
    });
  }


  toggleOrder(order: any): void {
  order.expanded = !order.expanded;
}

getStatusColor(status: string): string {
  switch (status?.toLowerCase()) {
    case 'confirmed': return 'green';
    case 'shipped': return 'orange';
    case 'cancelled': return 'red';
    case 'delivered': return 'blue';
    default: return 'black';
  }
}


}
