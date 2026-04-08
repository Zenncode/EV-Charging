import type { Product } from "../types/product";

interface ProductState {
  products: Product[];
}

type Listener = (state: ProductState) => void;

const state: ProductState = {
  products: [],
};

const listeners = new Set<Listener>();

function emit() {
  listeners.forEach((listener) => listener(state));
}

export const productStore = {
  getState() {
    return state;
  },
  setProducts(products: Product[]) {
    state.products = products;
    emit();
  },
  addProduct(product: Product) {
    state.products = [product, ...state.products];
    emit();
  },
  subscribe(listener: Listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
};
