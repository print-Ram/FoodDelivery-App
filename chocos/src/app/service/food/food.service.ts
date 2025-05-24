import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Foods } from '../../models/food';

@Injectable({
  providedIn: 'root',
})
export class FoodService {
  private apiUrl = 'https://springboot-app-400542225228.us-central1.run.app/api/products';

  constructor(private http: HttpClient) {}

  // Public - no auth required
  getAll(): Observable<Foods[]> {
    return this.http.get<Foods[]>(this.apiUrl);
  }

  getProductById(product_id: string): Observable<Foods> {
    return this.http.get<Foods>(`${this.apiUrl}/${product_id}`);
  }

  searchByName(name: string): Observable<Foods[]> {
    return this.http.get<Foods[]>(`${this.apiUrl}/search/${name}`);
  }

  // Authenticated - JWT sent automatically by interceptor
  addProduct(product: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/add_item`, product, {
      responseType: 'text' as 'json'
    });
  }

  // In FoodService
updateProduct(productId: string, product: Foods, options?: { headers: HttpHeaders }): Observable<string> {
  return this.http.put<string>(
    `${this.apiUrl}/auth/update_item/${productId}`,
    product,
    {
      ...options,
      responseType: 'text' as 'json'
    }
  );
}



  deleteProduct(product_id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/auth/delete_item/${product_id}`, {
      responseType: 'text'
    });
  }
}
