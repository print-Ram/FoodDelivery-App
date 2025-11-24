export interface Address {
  addressId?: string;
  userId?: string;
  name: string;
  phone: string;
  country: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  isDefault: boolean;

  // optional if you later store in DB
  deliveryFee?: number;
  distanceKm?: number;
}