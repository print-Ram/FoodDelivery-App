import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private baseUrl = 'https://springboot-app-400542225228.us-central1.run.app/auth/orders';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = sessionStorage.getItem('token');
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  // USER
  getMyOrders(): Observable<any> {
    return this.http.get(`${this.baseUrl}/my`, { headers: this.getHeaders() });
  }

  getMyOrderById(orderId: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/my/${orderId}`, { headers: this.getHeaders() });
  }

  placeOrder(order: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/place`, order, { headers: this.getHeaders() });
  }

  // ADMIN
  getAllOrders(): Observable<any> {
    return this.http.get(`${this.baseUrl}`, { headers: this.getHeaders() });
  }

updateOrderStatus(orderId: string, status: string): Observable<any> {
  return this.http.put(
    `${this.baseUrl}/${orderId}/status?status=${status}`,
    {},
    {
      headers: this.getHeaders(),
      responseType: 'text' 
    }
  );
}



  deleteOrder(orderId: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${orderId}`, { headers: this.getHeaders(),responseType: 'text' });
  }
}