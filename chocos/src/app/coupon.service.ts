import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface CouponApplyRequestItem {
  productId: string;
  quantity: number;
  price: number;
}

export interface CouponApplyRequest {
  code: string;
  userId: string;
  orderTotal: number;
  items: CouponApplyRequestItem[];
}

export interface CouponApplyResponse {
  valid: boolean;
  discount: number;
  message: string;
}

export interface Coupon {
  id?: string;
  code: string;
  discount: number;         // could be % or flat, as per backend
  description: string;
  active: boolean;
  productId?: string | null;
  nthOrder?: number | null;
}

@Injectable({
  providedIn: 'root'
})
export class CouponService {
  private baseUrl = 'http://localhost:8080/api/coupons';  // your Spring Boot backend

  constructor(private http: HttpClient) {}

  // ======= ADMIN API =======
  getAllCoupons(): Observable<Coupon[]> {
    return this.http.get<Coupon[]>(`${this.baseUrl}/admin/all`);
  }

  createCoupon(coupon: Coupon): Observable<Coupon> {
    return this.http.post<Coupon>(`${this.baseUrl}/admin/create`, coupon);
  }

  updateCoupon(id: string, coupon: Coupon): Observable<Coupon> {
    return this.http.put<Coupon>(`${this.baseUrl}/admin/update/${id}`, coupon);
  }

  deleteCoupon(id: string): Observable<string> {
  return this.http.delete(`${this.baseUrl}/admin/delete/${id}`, {
    responseType: 'text'
  }) as Observable<string>;
}


  // ======= USER API =======
  getActiveCoupons(): Observable<Coupon[]> {
    return this.http.get<Coupon[]>(`${this.baseUrl}/active`);
  }

 getCouponByCode(code: string): Observable<Coupon> {
    return this.http.get<Coupon>(`${this.baseUrl}/apply?code=${code}`);
  }

  applyCoupon(body: CouponApplyRequest): Observable<CouponApplyResponse> {
    return this.http.post<CouponApplyResponse>(`${this.baseUrl}/apply`, body);
  }
}
