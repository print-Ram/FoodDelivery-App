import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Foods } from '../../models/food';

@Injectable({
  providedIn: 'root',
})
export class FoodService {
  private apiUrl = 'https://springboot-app-400542225228.us-central1.run.app/api/products'; // adjust if needed

  constructor(private http: HttpClient) {}

  getAll(): Observable<Foods[]> {
    return this.http.get<Foods[]>(this.apiUrl);
  }

  getProductById(product_id: string): Observable<Foods> {
    return this.http.get<Foods>(`${this.apiUrl}/${product_id}`);
  }

  searchByName(name: string): Observable<Foods[]> {
    return this.http.get<Foods[]>(`${this.apiUrl}/search/${name}`);
  }

  addProduct(product: any): Observable<any> {
    return this.http.post<any>('https://springboot-app-400542225228.us-central1.run.app/api/products', product, {
      responseType: 'text' as 'json'
    });
  }
  
  updateProduct(product_id: string, product: Foods): Observable<string> {
    return this.http.put<string>(`${this.apiUrl}/${product_id}`, product);
  }

  deleteProduct(product_id: string): Observable<string> {
    const url = `${this.apiUrl}/${product_id}`;
    return this.http.delete(url, { responseType: 'text' }); // Set responseType to 'text'
  }
}
