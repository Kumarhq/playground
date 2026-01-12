import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  currency: string;
  imageUrl: string;
  inStock: boolean;
  stockQuantity: number;
  ingredients: string[];
  allergens: string[];
  tags: string[];
}

export interface CartItem {
  productId: string;
  product: Product;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  addedAt: string;
}

export interface Cart {
  cart: {
    id: string;
    items: any[];
  };
  items: CartItem[];
  subtotal: number;
  itemCount: number;
}

export interface CartResponse {
  id: string;
  userId?: string;
  items: any[];
  createdAt: string;
  updatedAt: string;
}

export interface CheckoutSession {
  sessionId: string;
  checkoutUrl: string;
  expiresAt: string;
}

export interface Order {
  orderId: string;
  sessionId: string;
  status: string;
  items: any[];
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  currency: string;
  paymentStatus: string;
  fulfillmentStatus: string;
  createdAt: string;
}

export const api = {
  // Products
  async getProducts(): Promise<Product[]> {
    const response = await axios.get(`${API_BASE_URL}/products`);
    return response.data.data;
  },

  async getProduct(id: string): Promise<Product> {
    const response = await axios.get(`${API_BASE_URL}/products/${id}`);
    return response.data.data;
  },

  async searchProducts(query: string): Promise<Product[]> {
    const response = await axios.get(`${API_BASE_URL}/products?search=${query}`);
    return response.data.data;
  },

  // Cart
  async createCart(): Promise<CartResponse> {
    const response = await axios.post(`${API_BASE_URL}/cart`);
    return response.data.data;
  },

  async getCart(cartId: string): Promise<Cart> {
    const response = await axios.get(`${API_BASE_URL}/cart/${cartId}`);
    return response.data.data;
  },

  async addToCart(cartId: string, productId: string, quantity: number): Promise<Cart> {
    const response = await axios.post(`${API_BASE_URL}/cart/${cartId}/items`, {
      productId,
      quantity
    });
    return response.data.data;
  },

  async updateCartItem(cartId: string, productId: string, quantity: number): Promise<Cart> {
    const response = await axios.put(`${API_BASE_URL}/cart/${cartId}/items/${productId}`, {
      quantity
    });
    return response.data.data;
  },

  async removeFromCart(cartId: string, productId: string): Promise<Cart> {
    const response = await axios.delete(`${API_BASE_URL}/cart/${cartId}/items/${productId}`);
    return response.data.data;
  },

  async clearCart(cartId: string): Promise<void> {
    await axios.delete(`${API_BASE_URL}/cart/${cartId}`);
  },

  // UCP Checkout
  async createCheckoutSession(cartId: string): Promise<CheckoutSession> {
    const response = await axios.post(`${API_BASE_URL}/ucp/checkout/sessions`, {
      cartId
    });
    return response.data.data;
  },

  async completeCheckout(sessionId: string, customerId?: string): Promise<Order> {
    const response = await axios.post(
      `${API_BASE_URL}/ucp/checkout/sessions/${sessionId}/complete`,
      { customerId }
    );
    return response.data.data;
  },

  async getOrder(orderId: string): Promise<Order> {
    const response = await axios.get(`${API_BASE_URL}/ucp/orders/${orderId}`);
    return response.data.data;
  }
};
