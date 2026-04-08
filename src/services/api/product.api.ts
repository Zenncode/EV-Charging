import type { CreateProductPayload, Product, ProductFilter } from "../../types/product";
import type { PaginatedResponse } from "../../types/api";
import { apiClient } from "./client";
import { endpoints } from "./endpoints";

function toQuery(params: ProductFilter = {}) {
  const searchParams = new URLSearchParams();
  if (params.search) searchParams.set("search", params.search);
  if (params.page != null) searchParams.set("page", String(params.page));
  if (params.limit != null) searchParams.set("limit", String(params.limit));
  const query = searchParams.toString();
  return query ? `?${query}` : "";
}

export function listProducts(params?: ProductFilter) {
  return apiClient.get<PaginatedResponse<Product>>(`${endpoints.product.list}${toQuery(params)}`);
}

export function getProductById(id: string) {
  return apiClient.get<Product>(endpoints.product.detail(id));
}

export function createProduct(payload: CreateProductPayload) {
  return apiClient.post<Product>(endpoints.product.create, payload);
}
