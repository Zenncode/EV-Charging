export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  imageUrl?: string;
  createdAt?: string;
}

export interface ProductFilter {
  search?: string;
  page?: number;
  limit?: number;
}

export interface CreateProductPayload {
  title: string;
  description: string;
  price: number;
  currency?: string;
  imageUrl?: string;
}
