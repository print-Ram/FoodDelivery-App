export class Foods {
  product_id!: string;
  price!: number;
  name!: string;
  description!: string;
  imageurl!: string;
  category?: string;
  categoryDescription?:string; // optional
  categoryBgImageUrl?:string;
  subcategory?: string;
}
