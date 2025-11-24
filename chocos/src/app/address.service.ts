import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Address } from './models/address';

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

@Injectable({
  providedIn: 'root'
})
export class AddressService {

  private baseUrl = 'http://localhost:8080/api/addresses';

  constructor(private http: HttpClient) {}

  /** GET: returns JSON list of Address[] */
  getUserAddresses(userId: string): Observable<Address[]> {
    return this.http.get<Address[]>(`${this.baseUrl}/user/${userId}`);
  }

  /** POST: returns plain text (String) */
addAddress(address: Address): Observable<string> {
  const userId = sessionStorage.getItem('userId'); // <-- IMPORTANT

  const payload = {
    ...address,
    userId: userId
  };

  return this.http.post(`${this.baseUrl}`, payload, {
    responseType: 'text'
  });
}


  /** DELETE: returns plain text (String) */
  deleteAddress(userId: string, addressId: string): Observable<string> {
  return this.http.delete(
    `${this.baseUrl}/user/${userId}/${addressId}`,
    { responseType: 'text'}
  );
}


  getAddressSuggestions(query: string) {
  return this.http.get<AddressSuggestion[]>(
    `http://localhost:8080/auth/orders/address-suggestions`,
    {
      params: { query }
    }
  );
}

updateAddress(addressId: string, payload: Address): Observable<string> {
  return this.http.put(
    `${this.baseUrl}/${addressId}`,
    payload,
    { responseType: 'text' }
  );
}


  getAddressFromCoords(lat: number, lng: number) {
  return this.http.get<AddressFromCoords>(
    `http://localhost:8080/auth/orders/get-address`,
    {
      params: {
        lat: lat,
        lng: lng
      }
    }
  );
}

getFullAddressDetails(placeId: string) {
  return this.http.get<any>(
    `http://localhost:8080/auth/orders/address-details`,
    { params: { placeId } }
  );
}



}
