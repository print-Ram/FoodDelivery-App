import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Foods } from '../../models/food';


@Injectable({
  providedIn: 'root',
})
export class FoodService {
  private apiUrl = 'http://localhost:8080/api/products';

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
  // product.service.ts or wherever fs.addProduct() is defined

addProduct(product:Foods): Observable<any> {
  const token = sessionStorage.getItem('token') || '';
  const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
  return this.http.post(`${this.apiUrl}/auth/add_item`, product, { headers });
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



  deleteProduct(productId: string): Observable<any> {
  const token = sessionStorage.getItem('token') || '';
  const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
  return this.http.delete(`${this.apiUrl}/auth/delete_item/${productId}`, { headers ,responseType: 'text' as 'json' });
}

}
