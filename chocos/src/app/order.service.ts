import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private baseUrl = 'http://localhost:8080/auth/orders';
  private apiUrl = 'http://localhost:8080/api';

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
    return this.http.get(`${this.baseUrl}/my/${orderId}`, { headers: this.getHeaders(),responseType:'text' });
  }

  placeOrder(order: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/place`, order, { headers: this.getHeaders(),responseType:'text' });
  }

  getOrderByIdWithProductNames(orderId: string): Observable<any> {
  return this.http.get<any>(`${this.baseUrl}/my/${orderId}`, { headers: this.getHeaders()});
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

updateShippingDetails(orderId: string, senderName: string, courierService: string, trackingId: string) {
  const params = new HttpParams()
    .set('orderId', orderId)
    .set('senderName', senderName)
    .set('courierService', courierService)
    .set('trackingId', trackingId);

  return this.http.post(`${this.baseUrl}/update-shipping`, null, { params,responseType: 'text' });
}

appendAddressToUser(userId: string, address: any) {
  return this.http.post(
    `http://localhost:8080/api/auth/${userId}/address`,
    address
  );
}


  deleteOrder(orderId: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${orderId}`, { headers: this.getHeaders(),responseType: 'text' });
  }

  //USERS
  // Get all users
  getAllUsers(): Observable<any[]> {
  const token = sessionStorage.getItem('token') || '';
  const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
  return this.http.get<any[]>(`${this.apiUrl}/auth`, { headers });
}

  // Delete user
  deleteUser(userId: string): Observable<any> {
  const token = sessionStorage.getItem('token') || '';
  const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
  return this.http.delete(`${this.apiUrl}/auth/${userId}`, { headers,responseType: 'text'});
}

getUserById(userId: string): Observable<any> {
  const headers = this.getHeaders(); // assuming this adds the token
  return this.http.get<any>(`${this.apiUrl}/auth/${userId}`, { headers });
}


}
